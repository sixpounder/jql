import { isUndefined } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class DocumentDatasource implements AsyncDataSource<Pick<Element, keyof Element>> {
  public static matchDocumentQueryString(value: string): RegExpMatchArray | null {
    return value.match(/document\.(.*)/);
  }

  __typeId(): string {
    return "DocumentDatasource";
  }

  public static fromString(value: string): DocumentDatasource | null {
    const matched = DocumentDatasource.matchDocumentQueryString(value);
    if (matched?.length) {
      return new DocumentDatasource(document, matched[1]);
    } else {
      return null;
    }
  }

  constructor(private source: ParentNode, private selector: string) {}

  async entries<U extends keyof Element>(filter?: QueryFilterProtocol, projection?: Array<U>):
    Promise<Iterable<Pick<Element, U>>> {
        
    const pickResults = async (elements: NodeList, filter: QueryFilterProtocol, projection?: Array<U>) => {
      const filteredOutput: Array<Pick<Element, U>> = [];
      for (let index = 0; index < elements.length; index++) {
        const element = elements.item(index) as Node;
        if (await filter.apply(element)) {
          filteredOutput.push(project(element as unknown as Element, projection));
        }
      }

      return filteredOutput;
    };

    return isUndefined(filter)
      ? this.source.querySelectorAll(this.selector)
      : await pickResults(this.source.querySelectorAll(this.selector), filter, projection);
  }
}
