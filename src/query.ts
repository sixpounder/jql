import { QueryFilter, QueryFilterImpl, QueryFilterPredicate, and, filter, identity, or } from './filter';
import { isNull } from './utils';

export enum FilterChainType {
    Intersection,
    Union
}

export type ProjectionSpec = string | string[];

export class JSQuery {
    private rootNode: ParentNode | null = null;
    private projectionSpec: string[] | null = null;
    private rootFilter: QueryFilter = identity;

    constructor() {}

    public project(projection: ProjectionSpec): JSQuery {
        if (Array.isArray(projection)) {
            this.projectionSpec = projection;
        } else {
            this.projectionSpec = projection.split(',').map(s => s.trim());
        }
        return this;
    }

    public from(rootNode: ParentNode): JSQuery {
        this.rootNode = rootNode;
        return this;
    }

    public where(...conditions: (QueryFilterPredicate | QueryFilter)[]): JSQueryFilterBuilder {
        if (conditions.length === 1 && QueryFilterImpl.isQueryFilterPredicate(conditions[0])) {
            this.rootFilter = filter(conditions[0])
        } else {
            this.rootFilter = and(...conditions);
        }

        return new JSQueryFilterBuilder(this);
    }

    public or(...conditions: (QueryFilterPredicate | QueryFilter)[]): JSQueryFilterBuilder {
        if (conditions.length === 1 && QueryFilterImpl.isQueryFilterPredicate(conditions[0])) {
            this.rootFilter = or(filter(conditions[0]))
        } else {
            this.rootFilter = or(...conditions);
        }

        return new JSQueryFilterBuilder(this);
    }

    public exec(): Element[] {
        if (isNull(this.rootNode)) {
            throw new Error('Cannot run a query without a source. Use .from(...) to set one.');
        }

        if (isNull(this.projectionSpec)) {
            throw new Error(
                'Cannot run a query without a projection. Use .project(...) or the select() function to set one.'
            );
        }

        const returnedNodes: Element[] = [];

        for (const node of this.rootNode.querySelectorAll(this.projectionSpec.join(', ')).entries()) {
            const el = node[1];

            if (this.rootFilter.apply(el)) {
                returnedNodes.push(el);
            }
        }

        return returnedNodes;
    }

    public describe(): string {
        return JSON.stringify(this)
    }
}

export class JSQueryFilterBuilder {
    constructor(private parent: JSQuery) {}

    public and(filter: QueryFilterPredicate | QueryFilter): JSQueryFilterBuilder {
        this.parent.where(filter);
        return this;
    }

    public exec(): Element[] {
        return this.parent.exec();
    }
}

export const select = (what: ProjectionSpec) => {
    return new JSQuery().project(what);
}
