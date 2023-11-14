/**
 * A predicate applied to an `Element`
 */
export type QueryFilterPredicate = (el: Element) => boolean;

/**
 * Represent the operator to apply to a series of predicates, logical AND (intersection) or OR (union)
 */
export enum QueryFilterChainOperator {
    Intersection,
    Union
}

/**
 * Implemented by types who wants to apply some kind of filter to an `Element`
 */
export interface QueryFilter {
    apply(el: Element): boolean
}

/**
 * Basic implementor of `QueryFilter`. Do not instantiate this class directly, use the appropriate
 * functions provided: `and`, `or` and `not`
 */
export class QueryFilterImpl implements QueryFilter {
    constructor(
        private _chainOp: QueryFilterChainOperator = QueryFilterChainOperator.Intersection,
        private _negated: boolean = false,
        private _filters: (QueryFilter | QueryFilterPredicate)[] = []
    ) {}

    public get chainOp(): QueryFilterChainOperator {
        return this._chainOp;
    }

    public get negated(): boolean {
        return this._negated;
    }

    public get filters(): (QueryFilter | QueryFilterPredicate)[] {
        return this._filters;
    }

    apply(el: Element): boolean {
        let provisional;
        switch (this.chainOp) {
        default:
        case QueryFilterChainOperator.Intersection:
            provisional = this.filters.reduce((accumulator, fn) => {
                return accumulator && (QueryFilterImpl.isQueryFilterPredicate(fn) ? fn(el) : fn.apply(el));
            }, true);
            break;
        case QueryFilterChainOperator.Union:
            provisional = this.filters.reduce((accumulator, fn) => {
                return accumulator || (QueryFilterImpl.isQueryFilterPredicate(fn) ? fn(el) : fn.apply(el));
            }, false);
            break;
        }

        return this.negated ? !provisional : provisional;
    }

    static isQueryFilter(value: any): value is QueryFilter {
        return typeof value !== 'function';
    }
    
    static isQueryFilterPredicate(value: any): value is QueryFilterPredicate {
        return typeof value === 'function';
    }
}

export const filter = (predicate: QueryFilterPredicate): QueryFilter => {
    return new QueryFilterImpl(QueryFilterChainOperator.Intersection, false, [predicate]);
}

export const and = (...predicates: (QueryFilter | QueryFilterPredicate)[]): QueryFilter => {
    return new QueryFilterImpl(QueryFilterChainOperator.Intersection, false, predicates);
}

export const or = (...predicates: (QueryFilter | QueryFilterPredicate)[]): QueryFilter => {
    return new QueryFilterImpl(QueryFilterChainOperator.Union, false, predicates);
}

export const not = (predicate: QueryFilter | QueryFilterPredicate): QueryFilter => {
    return new QueryFilterImpl(QueryFilterChainOperator.Intersection, true, [predicate]);
}

export const identity: QueryFilter = filter(() => true);