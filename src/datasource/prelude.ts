import { AnyFilter } from "../filter";

export interface QueryDataSource<T> {
    /**
     * Provides an iterator over entries for this data source. A filter is passed along with it, in case
     * this source can filter eagerly.
     * @param fitler - The filter to apply, if possible
     * @returns A tuple consisting of an iterable over the entries for this data source and a boolean
     * indicating whether the filter was applied eagerly or not.
     */
    entries(fitler: AnyFilter | null): [Iterable<T>, boolean];
}

export type AnyRawDataSource = Record<string | number | symbol, any> | Array<any> | ParentNode | string;

export type AnyDataSource = Record<string | number | symbol, any> | Array<any> | ParentNode;
