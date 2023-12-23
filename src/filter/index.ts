import { isPromise, promisify } from "../inspection";

/**
 * A predicate applied to an `Element`
 */
export type QueryFilterPredicate = (el: Element) => boolean;

export type QueryFilterPredicateAsync = (el: Element) => Promise<boolean>;

export type AnyFilter = QueryFilterProtocol | QueryFilterPredicate | QueryFilterPredicateAsync;

export type AnyAsyncFilter = QueryFilterProtocol | QueryFilterPredicateAsync;

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
export interface QueryFilterProtocol {
    apply(el: any): Promise<boolean>
}

/**
 * Basic implementor of `QueryFilterProtocol`. Do not instantiate this class directly, use the appropriate
 * functions provided: `and`, `or` and `not`
 */
export class QueryFilter implements QueryFilterProtocol {
    constructor(
        private _chainOp: QueryFilterChainOperator = QueryFilterChainOperator.Intersection,
        private _negated: boolean = false,
        private _filters: AnyAsyncFilter[] = [],
    ) {
        this._filters = this._filters.map(maybeAsyncFilter => {
            if (isPredicate(maybeAsyncFilter)) {
                return promisify(maybeAsyncFilter);
            } else {
                return maybeAsyncFilter;
            }
        })
    }

    public get chainOp(): QueryFilterChainOperator {
        return this._chainOp;
    }

    public get negated(): boolean {
        return this._negated;
    }

    public get filters(): AnyAsyncFilter[] {
        return this._filters;
    }

    /**
     * Applies this filter to `element`
     * @param element - the evaluated element
     * @returns - A promise of the boolean resolved by this filter
     */
    async apply(element: Element): Promise<boolean> {
        let provisional;
        if (this.chainOp === QueryFilterChainOperator.Union) {
            provisional = false;
            for (let i = 0; i < this.filters.length; i++) {
                const fn = this.filters[i];
                const res = await callFilter(fn, element);
                provisional = provisional || res;
            }
        } else {
            provisional = true;
            for (let i = 0; i < this.filters.length; i++) {
                const fn = this.filters[i];
                const res = await callFilter(fn, element);
                provisional = provisional && res;
            }
        }

        return this.negated ? !provisional : provisional;
    }
}

/**
 * Calls fn asyncrounously, where fn `AnyFilter`
 * @param fn - the filter to call
 * @param el - the element of the predicate
 * @returns - a promise of the boolean resolved by the predicate
 */
const callFilter = async (fn: AnyFilter, el: Element): Promise<boolean> => {

    return isPredicate(fn)
        ? promisify<boolean>(fn)(el)
        : isQueryFilter(fn)
            ? fn.apply(el)
            : fn(el);
}

/**
 * Asses if `value` is any object complying with `QueryFilterProtocol`
 * @param value - the value to inspect
 * @returns - If value complies with `QueryFilterProtocol`
 */
export const isQueryFilter = (value: any): value is QueryFilterProtocol => {
    return value instanceof QueryFilter;
}

/**
 * Asses if `value` is a predicate
 * @param value - the value to inspect
 * @returns - If value is a predicate
 */
export const isPredicate = (value: any): value is QueryFilterPredicate => {
    return !isPromise(value) && typeof value === "function";
}

/**
 * Asses if `value` is an asyncronous predicate
 * @param value - the value to inspect
 * @returns - If value is an asyncronous predicate
 */
export const isPredicateAsync = (value: any): value is QueryFilterPredicateAsync => {
    return isPromise(value);
}

/**
 * Creates a single filter from a predicate
 * @param predicate 
 * @returns 
 */
export const filter = (predicate: QueryFilterPredicate): QueryFilterProtocol => {
    return new QueryFilter(QueryFilterChainOperator.Intersection, false, [predicate]);
}

/**
 * Constructs a filter whose result is the intersection of the results of a set of `filters` (AND operatar)
 * @param filters - the filters to intersect
 * @returns - The built filter
 *
 * @example
 *  
 * Select all `div` and `a` that have `foo` AND `bar` as classes
 * 
 * ```typescript
 * select('div', 'a')
 *   .from(document)
 *   .where(
 *     and(
 *       (el) => el.classList.contains('foo'),
 *       (el) => el.classList.contains('bar')
 *     )
 *   )
 * ```
 */
export const and = (...filters: AnyFilter[]): QueryFilterProtocol => {
    return new QueryFilter(QueryFilterChainOperator.Intersection, false, filters);
}

/**
 * Constructs a filter whose result is the union of the results of a set of `filters` (OR operatar)
 * @param filters - the filters to intersect
 * @returns - The built filter
 * 
 * @example
 * 
 * Select all `div` and `a` that have `foo` or `bar` as classes
 * 
 * ```typescript
 * select('div', 'a')
 *   .from(document)
 *   .where(
 *     or(
 *       (el) => el.classList.contains('foo'),
 *       (el) => el.classList.contains('bar')
 *     )
 *   )
 * ```
 */
export const or = (...filters: AnyFilter[]): QueryFilterProtocol => {
    return new QueryFilter(QueryFilterChainOperator.Union, false, filters);
}

/**
 * Constructs a filter whose result is the negation of the result of another `filter` (NOT operatar)
 * @param filter - the filter to negate
 * @returns - The built filter
 * 
 * @example
 *  
 * Select all `div` and `a` that have `foo` but does NOT have `bar` as classes
 * 
 * ```typescript
 * select('div', 'a')
 *   .from(document)
 *   .where(
 *     and(
 *       hasClass('foo'),
 *       not(hasClass('bar'))
 *     )
 *   )
 * ```
 */
export const not = (filter: AnyFilter): QueryFilterProtocol => {
    return new QueryFilter(QueryFilterChainOperator.Intersection, true, [filter]);
}

/**
 * The identity filter. Basically a filter that always evaluates to `ŧrue`.
 */
export const identity: QueryFilterProtocol = filter(() => true);
