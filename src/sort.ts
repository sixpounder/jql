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
export type Comparator = <X, Y>(a: X, b: Y) => Ordering;

export type SortRule = {
    comparator: Comparator,
    direction: SortDirection
}

export const sort = <T>(collection: T[], rule: SortRule): T[] => {
    return collection.toSorted((a, b) => {
        return rule.direction == SortDirection.Ascending
            ? rule.comparator(a, b)
            : rule.comparator(a, b) * -1;
    });
}