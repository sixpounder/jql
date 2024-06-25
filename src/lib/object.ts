import { has, keys } from "lodash-es";

export type Intersected<A, B> = {
    [K in keyof A & keyof B]: A[K] extends B[K] ? A[K] : never
}

export const intersect = <L, R>(a: L, b: R): Intersected<L, R> => {
  const merged: Intersected<L, R> = {} as Intersected<L, R>;
  const keysOfL: (keyof L)[] = keys(a) as (keyof L)[];
  keysOfL.filter(k => has(b, k)).forEach((keyOfL) => {
    const keyOfBoth: keyof L & keyof R = keyOfL as keyof L & keyof R;
    merged[keyOfBoth] = a[keyOfBoth] as any;
  })

  return merged;
}
