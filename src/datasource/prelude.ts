import { hasIn } from "lodash-es";
import { QueryFilterProtocol } from "../filter";

/**
 * Implementing this interface means being able to expose inner entries given a filter rule and a projection
 */
export interface AsyncDataSource<T, U extends keyof T = keyof T> {
  __typeId(): string;
  /**
   * Provides an iterator over entries for this data source. A filter is passed along with it, in case
   * this source can filter eagerly, along with a projection list to be applied.
   * @param filter - The filter to apply, if possible
   * @param projection - The projection set
   * @returns A tuple consisting of an iterable over the entries for this data source and a boolean
   * indicating whether the filter was applied eagerly or not.
   */
  entries(
    filter?: QueryFilterProtocol,
    projection?: Array<U>,
  ): Promise<Iterable<Pick<T, U>>>;
}

export const isDataSource = <T>(obj: any): obj is AsyncDataSource<T> => {
  return hasIn(obj, "__typeId") && hasIn(obj, "entries");
};

export const joinIdentity = (..._args: any[]): boolean => true;

/**
 * An arbitrary object
 */
export type AnyObject = Record<string | number | symbol, any>;

export type AnyDataSource =
  | AsyncDataSource<any>
  | AnyObject
  | AnyObject[]
  | ParentNode
  | string;

export type RawDataSource<T> = T extends AnyObject ? T
  : T extends Array<infer Item> ? Item[]
  : T extends ParentNode ? ParentNode
  : T extends AsyncDataSource<infer D> ? AsyncDataSource<D>
  :
    | T
    | string;

export type QueryResult = {
  [K: string]: Record<string | number | symbol, any>;
};
