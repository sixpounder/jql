import { get, isEmpty, isNull, isUndefined, set } from "lodash-es";
import { AnyObject, joinIdentity } from "./prelude";

/**
 * A predicate that consumes two inputs
 */
export type BiPredicate<T, U> = (a: T, b: U) => boolean;

export function project<T, U extends keyof T>(obj: T, projection: Array<U> | null | undefined) {
  if (isNull(projection) || isUndefined(projection)) {
    return obj;
  }

  if (isEmpty(projection)) {
    return obj;
  }

  const projectedObject: AnyObject = {};
  for (let index = 0; index < projection!.length; index++) {
    const proj = projection![index];
    set(projectedObject, proj, get(obj, proj, null));
  }

  return projectedObject as Pick<T, U>;
}

export function* cartesian<T, U>(
  lho: Iterable<T>,
  rho: Iterable<U>,
  predicate: BiPredicate<T, U> = joinIdentity
): Iterable<[T, U]> {
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
): AsyncIterable<[Awaited<T>, Awaited<U>]> {
  for await (const l of lho) {
    for await (const r of rho) {
      if (predicate(l, r)) {
        yield [l, r];
      }
    }
  }
}
