import { clone } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { BiPredicate, cartesian } from "./internals";
import { AsyncDataSource, joinIdentity } from "./prelude";

/**
 * An `AsyncDataSource` that is the full join of two other datasources
 */
export class FullJoined<T, U> implements AsyncDataSource<Pick<T & U, keyof (T & U)>>
{
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: BiPredicate<T, U> = joinIdentity
  ) {}

  __typeId(): string {
    return "FullJoined";
  }

  async entries(
    filter?: QueryFilterProtocol,
    _projection?: Array<keyof T>
  ): Promise<Iterable<Pick<T & U, keyof (T & U)>>> {
    const items: Pick<T & U, keyof (T & U)>[] = [];
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);

    // Keep track of which items have been matched
    const matchedFromLeft = new Set<number>();
    const matchedFromRight = new Set<number>();

    let i = 0;

    for (const lItem of lh) {
      let matched = false;
      let j = 0;

      for (const rItem of rh) {
        if (this.joinCondition(lItem, rItem)) {
          items.push({ ...clone(lItem), ...clone(rItem) });
          matched = true;
          matchedFromRight.add(j);
        }
        j++;
      }

      if (matched) {
        matchedFromLeft.add(i);
      }

      i++;
    }

    // Add unmatched items from collection1 with null for collection2
    i = 0;
    for (const lItem of lh) {
      if (!matchedFromLeft.has(i)) {
        items.push(clone(lItem) as any);
      }
      i++;
    }

    // Add unmatched items from collection2 with null for collection1
    let j = 0;
    for (const rItem of rh) {
      if (!matchedFromRight.has(j)) {
        items.push(clone(rItem) as any);
      }
      j++;
    }

    return items;
  }
}

/**
 * An `AsyncDataSource` that is the inner join of two other datasources
 */
export class InnerJoined<T, U> implements AsyncDataSource<Partial<T & U>> {
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: BiPredicate<T, U> = joinIdentity
  ) {}

  __typeId(): string {
    return "InnerJoined";
  }

  async entries(
    filter?: QueryFilterProtocol,
    _projection?: Array<keyof T>
  ): Promise<Iterable<Partial<T & U>>> {
    const items: Partial<T & U>[] = [];
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);
    for (const [l, r] of cartesian(lh, rh, this.joinCondition)) {
      items.push({ ...clone(l), ...r });
    }

    return items;
  }
}

/**
 * An `AsyncDataSource` that is the left join of two other datasources
 */
export class LeftJoined<T, U>
implements AsyncDataSource<Partial<T & Partial<U>>>
{
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: BiPredicate<T, U> = joinIdentity
  ) {}

  __typeId(): string {
    return "LeftJoined";
  }

  async entries(
    filter?: QueryFilterProtocol,
    _projection?: Array<keyof T>
  ): Promise<Iterable<Partial<T & Partial<U>>>> {
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);

    const items: Partial<T & Partial<U>>[] = [];

    for (const l of lh) {
      let matched = false;

      for (const r of rh) {
        if (this.joinCondition(l, r)) {
          items.push({
            ...clone(l),
            ...(this.joinCondition(l, r) ? r : {}),
          } as T & Partial<U>);

          matched = true;
        }
      }

      if (!matched) {
        items.push(clone(l) as T & Partial<U>);
      }
    }

    return items;
  }
}

/**
 * An `AsyncDataSource` that is the right join of two other datasources
 */
export class RightJoined<T, U>
implements AsyncDataSource<Partial<T & Partial<U>>>
{
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: BiPredicate<T, U> = joinIdentity
  ) {}

  __typeId(): string {
    return "RightJoined";
  }

  async entries(
    filter?: QueryFilterProtocol,
    _projection?: Array<keyof T>
  ): Promise<Iterable<Partial<T & Partial<U>>>> {
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);

    const items: Partial<T & Partial<U>>[] = [];

    for (const r of rh) {
      let matched = false;

      for (const l of lh) {
        if (this.joinCondition(l, r)) {
          items.push({
            ...clone(l),
            ...(this.joinCondition(l, r) ? r : {}),
          } as T & Partial<U>);

          matched = true;
        }
      }

      if (!matched) {
        items.push(clone(r) as T & Partial<U>);
      }
    }

    return items;
  }
}
