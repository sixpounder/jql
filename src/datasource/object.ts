import { isUndefined } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class ObjectDatasource<T, U extends keyof T = keyof T> implements AsyncDataSource<T, U> {
  constructor(private source: T, ..._args: any[]) {}

  __typeId(): string {
    return "ObjectDatasource";
  }

  async entries(
    filter?: QueryFilterProtocol,
    projection?: Array<U>
  ): Promise<Iterable<Pick<T, U>>> {
    return !isUndefined(filter)
      ? (await filter.apply(this.source))
        ? [project(this.source, projection)]
        : []
      : [project(this.source, projection)];
  }
}
