import { sortBy } from "lodash-es";

export enum Ordering {
    Before = -1,
    Same = 0,
    After = 1
}

export enum SortDirection {
    Ascending,
    Descending
}

/**
 * A comparator is a function that given two values `a` and `b` returns:
 * 
 * - A negative number if `a` preceeds `b`
 * - `Zero` if `a` and `b` are equal
 * - A positive number if `a` follows `b`
 */
export type Comparator<X> = (a: X, b: X) => Ordering;

export type SortRule = {
    field: string,
    direction: SortDirection
}

export const sort = <T>(collection: T[], rule: SortRule): T[] => {
    let ordered = sortBy(collection, rule.field);
    if (rule.direction === SortDirection.Descending) {
        ordered = ordered.reverse();
    }

    return ordered;
}
