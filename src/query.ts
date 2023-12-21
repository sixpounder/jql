import { DatasourceRepository } from "./datasource";
import { AnyRawDataSource, QueryDataSource } from "./datasource/prelude";
import {
    QueryFilterProtocol,
    QueryFilterPredicate,
    and,
    filter,
    identity,
    or,
    isPredicate,
    AnyFilter
} from "./filter";
import { Comparator, SortDirection, SortRule, sort } from "./sort";
import { isNull } from "./utils";

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

interface QueryResult { [K: string]: Record<string | number | symbol, any> }

class Query<O = QueryResult> implements Executable<O> {
    private datasource: DatasourceRepository = new DatasourceRepository();
    private projectionSpec: string[] | null = null;
    private filter: QueryFilterProtocol = identity;
    private resultsLimit = 0;
    private resultsOffset = 0;
    private sortRules: SortRule[] = [];

    constructor(...projectionSpec: string[]) {
        this.projectionSpec = projectionSpec;
    }

    /**
     * Adds a datasource for this query. This can be any javascript object, array or DOM node.
     * @param rootNode - The node for this query data source
     * @returns - the query with the data source added
     */
    public from(source: AnyRawDataSource): Query<O> {
        this.datasource.add(source);
        return this;
    }

    /**
     * Registers filters for this query
     * @param conditions - the filters to append to the filter list
     * @returns - The query with the filters appended
     */
    public where(...conditions: AnyFilter[]): FilterableQuery<O> {
        if (conditions.length === 1 && isPredicate(conditions[0])) {
            this.filter = filter(conditions[0])
        } else {
            this.filter = and(...conditions);
        }

        return new FilterableQuery(this);
    }

    public or(...conditions: AnyFilter[]): FilterableQuery<O> {
        if (conditions.length === 1 && isPredicate(conditions[0])) {
            this.filter = or(filter(conditions[0]))
        } else {
            this.filter = or(...conditions);
        }

        return new FilterableQuery(this);
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

    /**
     * Executes the query
     * @returns - The result set
     */
    public async run(): Promise<O[]> {
        if (isNull(this.datasource) || this.datasource.isEmpty()) {
            throw new Error("Cannot run a query without a source. Use .from(...) to set one.");
        }

        if (isNull(this.projectionSpec)) {
            throw new Error(
                "Cannot run a query without a projection. Use .select(...) or the select() builder function to set one."
            );
        }

        let returnedNodes: O[] = [];
        const datasources: QueryDataSource<any>[] = this.datasource.merge();

        // Extraction
        for (const source of datasources) {
            for (const node of source.entries(null)[0]) {
                if (await this.filter.apply(node)) {
    
                    // TODO: apply projection here
                    returnedNodes.push(node);
                }
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

    public describe(): string {
        return JSON.stringify(this)
    }
}

export class FilterableQuery<O = QueryResult> implements Executable<O> {
    constructor(private parent: Query<O>) {}

    public and(filter: QueryFilterPredicate | QueryFilterProtocol): FilterableQuery<O> {
        this.parent.where(filter);
        return this;
    }

    public or(...conditions: AnyFilter[]): FilterableQuery<O> {
        return this.parent.or(...conditions);
    }

    /**
     * Sets the limit of the result set size to `n`. `0` means no limit.
     * @param n - the number of entries to limit to
     * @returns - the query with a limit set
     */
    public limit(n: number) {
        return this.parent.limit(n);
    }

    /**
     * Sets the offset of the result set to `n`.
     * @param n - the offset index
     * @returns - the query with an offset set
     */
    public offset(n: number) {
        return this.parent.offset(n);
    }

    /**
     * Appends sort rules for this query
     * @param comparator - The comparator function. See `Comparator`.
     * @param direction - The direction of the sort. The default is `SortDirection.Ascending`
     */
    public sort(comparator: Comparator): void;
    public sort(comparator: Comparator, direction?: SortDirection): void {
        return this.parent.sort(comparator, direction);
    }

    /**
     * Executes the query
     * @returns - The result set
     */
    public async run(): Promise<O[]> {
        return this.parent.run();
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
    const query: Query = new Query(...projections);
    return query;
}
