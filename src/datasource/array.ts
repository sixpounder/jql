import { isNull } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AnyObject, DataSource } from "./prelude";
import { project } from "./internals";

export class ArrayQueryDatasource<T extends object> implements DataSource<T> {
  constructor(private source: AnyObject[], ..._args: any[]) {}

  async entries<U extends keyof T>(filter: QueryFilterProtocol | null, projection?: Array<U>):
        Promise<Iterable<Pick<T, U>>> {
        
    const filteredElements: Pick<T, U>[] = [];
    for (let index = 0; index < this.source.length; index++) {
      const element = this.source[index];
      if (!isNull(filter)) {
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
