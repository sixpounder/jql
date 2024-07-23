import { clone, merge } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { JoinPredicate, cartesian } from "./operators";
import { AsyncDataSource, joinIdentity } from "./prelude";

export class FullJoined<T, U> implements AsyncDataSource<Pick<T & U, keyof T & U>> {
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: JoinPredicate<T, U> = joinIdentity,
  ) { }

  __typeId(): string {
    return "FullyJoined";
  }

  async entries(
    filter: QueryFilterProtocol | null,
    _projection?: Array<keyof T>,
  ): Promise<Iterable<Pick<T & U, keyof T & U>>> {
    const items: Pick<T & U, keyof T & U>[] = [];
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);
    for (const [l, r] of cartesian(lh, rh, this.joinCondition)) {
      items.push(merge(clone(l), r));
    }

    return items;
  }
}

export class InnerJoined<T, U> implements AsyncDataSource<Partial<T & U>> {
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: JoinPredicate<T, U> = joinIdentity,
  ) { }

  __typeId(): string {
    return "InnerJoined";
  }

  async entries(
    filter: QueryFilterProtocol | null,
    _projection?: Array<keyof T>,
  ): Promise<Iterable<Partial<T & U>>> {
    const items: Partial<T & U>[] = [];
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);
    for (const [l, r] of cartesian(lh, rh, this.joinCondition)) {
      items.push(merge(clone(l), r));
    }

    return items;
  }
}

export class LeftJoined<T, U> implements AsyncDataSource<Partial<T & Partial<U>>> {
  constructor(
    private lh: AsyncDataSource<T>,
    private rh: AsyncDataSource<U>,
    private joinCondition: JoinPredicate<T, U> = joinIdentity,
  ) { }

  __typeId(): string {
    return "LeftJoined";
  }

  async entries(
    filter: QueryFilterProtocol | null,
    _projection?: Array<keyof T>,
  ): Promise<Iterable<Partial<T & Partial<U>>>> {
    const [lh, rh] = await Promise.all([
      this.lh.entries(filter),
      this.rh.entries(filter),
    ]);

    const items: Partial<T & Partial<U>>[] = [];
    for (const l of lh) {
      for (const r of rh) {
        items.push(
          merge(clone(l), this.joinCondition(l, r) ? r : {}) as T & Partial<U>,
        );
      }
    }

    return items;
  }
}
