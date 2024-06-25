import { isNull } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AnyObject, AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class ArrayDatasource<T, K extends keyof T> implements AsyncDataSource<Pick<T, K>> {
  constructor(private source: AnyObject[], ..._args: any[]) {}

  async entries(
    filter: QueryFilterProtocol | null,
    projection?: Array<K>): Promise<Iterable<Pick<T, K>>> {
        
    const filteredElements: Pick<T, K>[] = [];
    for (let index = 0; index < this.source.length; index++) {
      const element = this.source[index];
      if (!isNull(filter)) {
        if (await filter.apply(element)) {
          filteredElements.push(project(element, projection) as Pick<T, K>);
        }
      } else {
        filteredElements.push(project(element, projection) as Pick<T, K>);
      }
    }

    return filteredElements;
  }
}
