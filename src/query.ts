import { DatasourceRepository } from "./datasource";
import { project } from "./datasource/internals";
import { AnyObject, AnyRawDataSource, DataSource, QueryResult } from "./datasource/prelude";
import {
    QueryFilterProtocol,
    and,
    filter,
    identity,
    isPredicate,
    AnyFilter
} from "./filter";
import { filter as projectedObject } from "lodash";
import { Comparator, SortDirection, SortRule, sort } from "./sort";
import { isNull, uniq } from "lodash";

export enum FilterChainType {
    Intersection,
    Union
}

/**
 * Implemented by types that can be `exec`uted at some point
 */
interface Executable<T> {
    /**
     * Executes the query and return a result
     */
    run(): Promise<T[]>
}

class Projection<O = QueryResult> {
    private projectionSpec: string[] | null = null;

    constructor(...projectionSpec: string[]) {
        this.projectionSpec = projectedObject(uniq(projectionSpec), (projectionItem) => projectionItem !== "*");
    }

    /**
     * Adds a datasource for this query. This can be any javascript object, array or DOM node.
     * @param rootNode - The node for this query data source
     * @returns - the query with the data source added
     */
    public from(source: AnyRawDataSource): FilterableQuery<O> {
        return new FilterableQuery(this, source);
    }

    public get projection() {
        return this.projectionSpec;
    }

    public describe(): string {
        return JSON.stringify(this)
    }
}

class FilterableQuery<O> implements Executable<O> {
    private datasource: DatasourceRepository = new DatasourceRepository();
    private resultsLimit = 0;
    private resultsOffset = 0;
    private sortRules: SortRule[] = [];
    private _filter: QueryFilterProtocol = identity;

    constructor(private parent: Projection<O>, source: AnyRawDataSource) {
        this.datasource.add(source);
    }

    /**
     * Registers filters for this query
     * @param conditions - the filters to append to the filter list
     * @returns - The query with the filters appended
     */
    public where(...conditions: AnyFilter[]): FilterableQuery<O> {
        if (conditions.length === 1 && isPredicate(conditions[0])) {
            this._filter = filter(conditions[0])
        } else {
            this._filter = and(...conditions);
        }

        return this;
    }

    /**
     * Sets the limit of the result set size to `n`. `0` means no limit.
     * @param n - the number of entries to limit to
     * @returns - the query with a limit set
     */
    public limit(n: number) {
        this.resultsLimit = n;
        return this;
    }

    /**
     * Sets the offset of the result set to `n`.
     * @param n - the offset index
     * @returns - the query with an offset set
     */
    public offset(n: number) {
        this.resultsOffset = n;
        return this;
    }

    /**
     * Appends sort rules for this query
     * @param comparator - The comparator function. See `Comparator`.
     * @param direction - The direction of the sort. The default is `SortDirection.Ascending`
     */
    public sort(comparator: Comparator, direction?: SortDirection): void {
        this.sortRules.push({
            comparator,
            direction: direction ?? SortDirection.Ascending
        })
    }

    public get filter() {
        return this._filter;
    }

    /**
     * Executes the query
     * @returns - The result set
     */
    public async run(): Promise<O[]> {
        if (isNull(this.datasource) || this.datasource.isEmpty()) {
            throw new Error("Cannot run a query without a source. Use .from(...) to set one.");
        }

        if (isNull(this.parent.projection)) {
            throw new Error(
                "Cannot run a query without a projection. Use .select(...) or the select() builder function to set one."
            );
        }

        let returnedNodes: O[] = [];
        const datasources: DataSource<AnyObject>[] = this.datasource.merge();

        // Extraction and filtering
        for (const source of datasources) {
            for (const node of await source.entries(this._filter, this.parent.projection)) {
                returnedNodes.push(project(node, this.parent.projection) as O);
            }
        }

        // Sorting
        if (this.sortRules.length) {
            for (let i = 0; i < this.sortRules.length; i++) {
                const rule = this.sortRules[i];
                sort(returnedNodes, rule);
            }
        }

        // Limit / offset
        if (this.resultsLimit !== 0 || this.resultsOffset !== 0) {
            returnedNodes = returnedNodes.slice(
                this.resultsOffset,
                this.resultsOffset + (this.resultsLimit === 0 ? returnedNodes.length - 1 : this.resultsLimit)
            );
        }

        return returnedNodes;
    }


}

/**
 * Create a query. This specifies what elements you wanna select, just like
 * a SQL projection
 * @param what - One or more strings identifying elements to select. This is effectively
 *               passed down to querySelectorAll in case of DOM sources, so you can use everything
 *               available to that API if you know how to.
 * @returns - A `Query` to further customize
 */
export const select = (...projections: string[]) => {
    const query: Projection = new Projection(...projections);
    return query;
}
