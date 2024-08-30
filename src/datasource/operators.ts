import { FullJoined, InnerJoined, LeftJoined, RightJoined } from "./joined";
import { AsyncDataSource, joinIdentity } from "./prelude";


/**
 * A predicate that consumes two inputs
 */
export type BiPredicate<T, U> = (a: T, b: U) => boolean;

export function* cartesian<T, U>(
  lho: Iterable<T> | Generator<T>,
  rho: Iterable<U> | Generator<U>,
  predicate: BiPredicate<T, U> = joinIdentity
): Generator<[T, U]> {
  for (const l of lho) {
    for (const r of rho) {
      if (predicate(l, r)) {
        yield [l, r];
      }
    }
  }
}

export async function* cartesianAsync<T, U>(
  lho: AsyncIterable<T>,
  rho: AsyncIterable<U>,
  predicate: BiPredicate<T, U> = joinIdentity
): AsyncGenerator<[Awaited<T>, Awaited<U>]> {
  for await (const l of lho) {
    for await (const r of rho) {
      if (predicate(l, r)) {
        yield [l, r];
      }
    }
  }
}

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