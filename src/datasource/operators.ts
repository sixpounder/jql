import { BiPredicate } from "./internals";
import { FullJoined, InnerJoined, LeftJoined, RightJoined } from "./joined";
import { AsyncDataSource } from "./prelude";

/**
 * Creates a datasource by joining two datasources on
 * a given (optional) predicate
 * @param a The left-hand datasource
 * @param b The right-hand datasource
 * @param pred The join predicate
 * @returns A full-join of the two datasources
 */
export function join<T, U>(
  a: AsyncDataSource<T>,
  b: AsyncDataSource<U>,
  pred?: BiPredicate<T, U>
): FullJoined<T, U> {
  return new FullJoined(a, b, pred);
}

/**
 * Creates a datasource by joining two datasources on
 * a given (optional) predicate
 * @param a The left-hand datasource
 * @param b The right-hand datasource
 * @param pred The join predicate
 * @returns An inner-join of the two datasources
 */
export function innerJoin<T, U>(
  a: AsyncDataSource<T>,
  b: AsyncDataSource<U>,
  pred?: BiPredicate<T, U>
): InnerJoined<T, U> {
  return new InnerJoined(a, b, pred);
}

/**
 * Creates a datasource by joining two datasources on
 * a given (optional) predicate
 * @param a The left-hand datasource
 * @param b The right-hand datasource
 * @param pred The join predicate
 * @returns A left-join of the two datasources
 */
export function leftJoin<T, U>(
  a: AsyncDataSource<T>,
  b: AsyncDataSource<U>,
  pred?: BiPredicate<T, U>
): LeftJoined<T, U> {
  return new LeftJoined(a, b, pred);
}

/**
 * Creates a datasource by joining two datasources on
 * a given (optional) predicate
 * @param a The left-hand datasource
 * @param b The right-hand datasource
 * @param pred The join predicate
 * @returns A right-join of the two datasources
 */
export function rightJoin<T, U>(
  a: AsyncDataSource<T>,
  b: AsyncDataSource<U>,
  pred?: BiPredicate<T, U>
): RightJoined<T, U> {
  return new RightJoined(a, b, pred);
}