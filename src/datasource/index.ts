import { isObjectLike, isString } from "lodash-es";
import { isParentNode } from "../inspection";
import { DocumentDatasource } from "./dom";
import { AsyncDataSource, isDataSource, RawDataSource } from "./prelude";
import { ArrayDatasource } from "./array";
import { ObjectDatasource } from "./object";

export * from "./prelude";
export * from "./array";
export * from "./dom";
export * from "./object";
export * from "./operators";
export * from "./joined";

export { BiPredicate } from "./internals";

/**
 * Transforms a value into a datasource
 * @param value
 * @param args
 * @returns
 */
export const datasource = <S, T>(
  value: RawDataSource<S>,
  ...args: any[]
): AsyncDataSource<T | Element> => {
  if (isDataSource(value)) {
    return value as AsyncDataSource<T>;
  } else if (Array.isArray(value)) {
    return new ArrayDatasource<T>(value, ...args);
  } else if (isString(value)) {
    return (DocumentDatasource.fromString<Element>(value) ??
      new DocumentDatasource<Element>(document, "*"));
  } else if (isParentNode(value)) {
    return new DocumentDatasource<Element>(value, args[0] ?? "*");
  } else if (isObjectLike(value)) {
    return new ObjectDatasource<T>(value as unknown as T, ...args);
  } else {
    // Whatever mate
    return value as AsyncDataSource<T>;
  }
};

export class DatasourceRepository {
  private sources: {
    alias: string | null;
    source: AsyncDataSource<unknown>;
  }[] = [];

  public add<T>(source: AsyncDataSource<T>): void;
  public add<T>(source: AsyncDataSource<T>, alias?: string): void {
    this.sources.push({
      alias: alias ?? null,
      source: datasource(source),
    });
  }

  public get(alias: string): AsyncDataSource<unknown> | undefined {
    return this.sources.find((e) => e.alias === alias)?.source;
  }

  public isEmpty(): boolean {
    return this.sources.length === 0;
  }

  public entries(): AsyncDataSource<unknown>[] {
    return this.sources.map((e) => e.source);
  }

  public merge(): AsyncDataSource<unknown>[] {
    let datasources: AsyncDataSource<unknown>[] = [];
    for (const ds of this.sources) {
      datasources = datasources.concat(ds.source);
    }

    return datasources;
  }
}
