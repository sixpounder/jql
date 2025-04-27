import { isUndefined } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AnyObject, AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class ArrayDatasource<T, U extends keyof T = keyof T> implements AsyncDataSource<T, U> {
  constructor(private source: AnyObject[], ..._args: any[]) {}

  __typeId(): string {
    return "ArrayDatasource";
  }

  async entries(
    filter?: QueryFilterProtocol,
    projection?: Array<U>): Promise<Iterable<Pick<T, U>>> {
        
    const filteredElements: Pick<T, U>[] = [];
    for (let index = 0; index < this.source.length; index++) {
      const element = this.source[index];
      if (!isUndefined(filter)) {
        if (await filter.apply(element)) {
          filteredElements.push(project(element, projection) as Pick<T, U>);
        }
      } else {
        filteredElements.push(project(element, projection) as Pick<T, U>);
      }
    }

    return filteredElements;
  }
}
