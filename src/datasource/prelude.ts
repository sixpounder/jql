import { has } from "lodash-es";
import { QueryFilterProtocol } from "../filter";

/**
 * Implementing this interface means being able to expose inner entries given a filter rule and a projection
 */
export interface AsyncDataSource<T> {
  /**
   * Provides an iterator over entries for this data source. A filter is passed along with it, in case
   * this source can filter eagerly, along with a projection list to be applied.
   * @param filter - The filter to apply, if possible
   * @param projection - The projection set
   * @returns A tuple consisting of an iterable over the entries for this data source and a boolean
   * indicating whether the filter was applied eagerly or not.
   */
  entries(filter: QueryFilterProtocol | null, projection?: Array<keyof T>): Promise<Iterable<T>>;
}

export const isDataSource = <T>(obj: any): obj is AsyncDataSource<T> => {
  return has(obj, "entries");
}

export const joinIdentity = (..._args: any[]): boolean => true;

export type AnyObject = Record<string | number | symbol, unknown>;

export type AnyDataSource = AsyncDataSource<unknown> | AnyObject | AnyObject[] | ParentNode | string;

export type QueryResult = { [K: string]: Record<string | number | symbol, any> }
