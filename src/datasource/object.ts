import { isNull } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class ObjectDatasource<T>
implements AsyncDataSource<T> {
  constructor(private source: T, ..._args: any[]) {}

  __typeId(): string {
    return "ObjectDatasource";
  }

  async entries<U extends keyof T>(filter: QueryFilterProtocol | null, projection?: Array<U>):
        Promise<Iterable<Pick<T, U>>> {

    return !isNull(filter)
      ? await filter.apply(this.source)
        ? [project(this.source, projection)]
        : []
      : [project(this.source, projection)];
  }
}
