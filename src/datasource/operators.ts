import { FullJoined, InnerJoined, LeftJoined, RightJoined } from "./joined";
import { AsyncDataSource, joinIdentity } from "./prelude";


export type JoinPredicate<T, U> = (a: T, b: U) => boolean;

export function* cartesian<T, U>(
  lho: Iterable<T> | Generator<T>,
  rho: Iterable<U> | Generator<U>,
  predicate: JoinPredicate<T, U> = joinIdentity
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
  predicate: JoinPredicate<T, U> = joinIdentity
): AsyncGenerator<[Awaited<T>, Awaited<U>]> {
  for await (const l of lho) {
    for await (const r of rho) {
      if (predicate(l, r)) {
        yield [l, r];
      }
    }
  }
}

export const join = 
    <T, U>(a: AsyncDataSource<T>, b: AsyncDataSource<U>, pred?: JoinPredicate<T, U>) => {
      return new FullJoined(a, b, pred);
    }

export const innerJoin = 
    <T, U>(a: AsyncDataSource<T>, b: AsyncDataSource<U>, pred?: JoinPredicate<T, U>) => {
      return new InnerJoined(a, b, pred);
    }

export const leftJoin = 
    <T, U>(a: AsyncDataSource<T>, b: AsyncDataSource<U>, pred?: JoinPredicate<T, U>) => {
      return new LeftJoined(a, b, pred);
    }

export const rightJoin = 
    <T, U>(a: AsyncDataSource<T>, b: AsyncDataSource<U>, pred?: JoinPredicate<T, U>) => {
      return new RightJoined(a, b, pred);
    }