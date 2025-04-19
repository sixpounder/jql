import { isUndefined } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AnyObject, AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class ArrayDatasource<T, K extends keyof T> implements AsyncDataSource<Pick<T, K>> {
  constructor(private source: AnyObject[], ..._args: any[]) {}

  __typeId(): string {
    return "ArrayDatasource";
  }

  async entries(
    filter?: QueryFilterProtocol,
    projection?: Array<K>): Promise<Iterable<Pick<T, K>>> {
        
    const filteredElements: Pick<T, K>[] = [];
    for (let index = 0; index < this.source.length; index++) {
      const element = this.source[index];
      if (!isUndefined(filter)) {
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
