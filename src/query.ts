import {
    QueryFilterProtocol,
    QueryFilterPredicate,
    and,
    filter,
    identity,
    or,
    isQueryFilterPredicate,
    AnyFilter
} from './filter';
import { isNull } from './utils';

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
    run(): Promise<T>
}

class Query implements Executable<Element[]> {
    private rootNode: ParentNode | null = null;
    private projectionSpec: string[] | null = null;
    private filter: QueryFilterProtocol = identity;
    private resultsLimit = 0;
    private resultsOffset = 0;

    constructor() {}

    /**
     * Sets the projection for this query
     * @param projection - the projected items
     * @returns 
     */
    public select(...projection: string[]): Query {
        this.projectionSpec = projection;
        return this;
    }

    /**
     * Defines the source for the query. This can be any javascript object.
     * @param rootNode - The root node for this query data source
     * @returns - the query with the data source set
     */
    public from(rootNode: ParentNode): Query {
        this.rootNode = rootNode;
        return this;
    }

    public where(...conditions: AnyFilter[]): QueryFilterBuilder {
        if (conditions.length === 1 && isQueryFilterPredicate(conditions[0])) {
            this.filter = filter(conditions[0])
        } else {
            this.filter = and(...conditions);
        }

        return new QueryFilterBuilder(this);
    }

    public or(...conditions: AnyFilter[]): QueryFilterBuilder {
        if (conditions.length === 1 && isQueryFilterPredicate(conditions[0])) {
            this.filter = or(filter(conditions[0]))
        } else {
            this.filter = or(...conditions);
        }

        return new QueryFilterBuilder(this);
    }

    public limit(n: number) {
        this.resultsLimit = n;
        return this;
    }

    public offset(n: number) {
        this.resultsOffset = n;
        return this;
    }

    public async run(): Promise<Element[]> {
        if (isNull(this.rootNode)) {
            throw new Error('Cannot run a query without a source. Use .from(...) to set one.');
        }

        if (isNull(this.projectionSpec)) {
            throw new Error(
                'Cannot run a query without a projection. Use .select(...) or the select() builder function to set one.'
            );
        }

        let returnedNodes: Element[] = [];

        for (const node of this.rootNode.querySelectorAll(this.projectionSpec.join(', ')).values()) {
            if (await this.filter.apply(node)) {
                returnedNodes.push(node);
            }
        }

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

export class QueryFilterBuilder implements Executable<Element[]> {
    constructor(private parent: Query) {}

    public and(filter: QueryFilterPredicate | QueryFilterProtocol): QueryFilterBuilder {
        this.parent.where(filter);
        return this;
    }

    public async run(): Promise<Element[]> {
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
export const select = (...what: string[]) => {
    return new Query().select(...what);
}
