import { isUndefined } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { AsyncDataSource } from "./prelude";
import { project } from "./internals";

export class DocumentDatasource<
  T extends ParentNode,
  U extends keyof T = keyof T
> implements AsyncDataSource<Pick<T, U>> {
  private static matchDocumentQueryString(
    value: string,
  ): RegExpMatchArray | null {
    return value.match(/document\.(.*)/);
  }

  public static fromString<T extends ParentNode>(
    value: string,
  ): DocumentDatasource<T> | undefined {
    const matched = DocumentDatasource.matchDocumentQueryString(value);
    if (matched?.length) {
      return new DocumentDatasource(document, matched[1]);
    } else {
      return undefined;
    }
  }

  __typeId(): string {
    return "DocumentDatasource";
  }

  constructor(private source: ParentNode, private selector: string) {}

  async entries(
    filter?: QueryFilterProtocol,
    projection?: Array<U>,
  ): Promise<Iterable<Pick<T, U>>> {
    const pickResults = async (
      elements: NodeList,
      filter: QueryFilterProtocol,
      projection?: U[],
    ) => {
      const filteredOutput: Array<Pick<T, U>> = [];
      for (let index = 0; index < elements.length; index++) {
        const element = elements.item(index) as Node;
        if (await filter.apply(element)) {
          filteredOutput.push(project(element as unknown as T, projection));
        }
      }

      return filteredOutput;
    };

    return isUndefined(filter)
      ? this.source.querySelectorAll(this.selector) as unknown as T[]
      : await pickResults(
        this.source.querySelectorAll(this.selector),
        filter,
        projection,
      );
  }
}
