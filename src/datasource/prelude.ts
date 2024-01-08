import { QueryFilterProtocol } from "../filter";

/**
 * Implementing this interface means being able to expose inner entries given a filter rule and a projection
 */
export interface DataSource<T extends object> {
  /**
   * Provides an iterator over entries for this data source. A filter is passed along with it, in case
   * this source can filter eagerly, along with a projection list to be applied.
   * @param filter - The filter to apply, if possible
   * @param projection - The projection set
   * @returns A tuple consisting of an iterable over the entries for this data source and a boolean
   * indicating whether the filter was applied eagerly or not.
   */
  entries(filter: QueryFilterProtocol | null, projection?: Array<keyof T>): Promise<Iterable<Pick<T, keyof T>>>;
}

export type AnyObject = Record<string | number | symbol, unknown>;

export type AnyRawDataSource = AnyObject | ParentNode | string;

export type QueryResult = { [K: string]: Record<string | number | symbol, any> }
