import { isString } from "lodash-es";
import { ObjectDatasource, ArrayDatasource } from ".";
import { isParentNode } from "../inspection";
import { DocumentDatasource } from "./dom";
import { AnyObject, AnyDataSource, AsyncDataSource, isDataSource } from "./prelude";

export * from "./array";
export * from "./dom";
export * from "./object";
export * from "./operators";

/**
 * Transforms a value into a datasource
 * @param value 
 * @param args 
 * @returns 
 */
export const datasource = (value: AnyDataSource, ...args: any[]): AsyncDataSource<AnyObject> => {
  if (isDataSource(value)) {
    return value as AsyncDataSource<AnyObject>;
  } else if (isParentNode(value)) {
    return new DocumentDatasource(value, args[0] ?? "*");
  } else if (Array.isArray(value)) {
    return new ArrayDatasource(value, ...args);
  } else if (isString(value)) {
    return DocumentDatasource.fromString(value) ?? new DocumentDatasource(document, "*");
  } else {
    return new ObjectDatasource(value, ...args);
  }
}

export class DatasourceRepository {
  private sources: { alias: string | null, source: AsyncDataSource<AnyObject> }[] = [];

  public add(source: AnyDataSource): void;
  public add(source: AnyDataSource, alias?: string): void {
    this.sources.push({
      alias: alias ?? null,
      source: datasource(source)
    });
  }

  public get(alias: string): AsyncDataSource<AnyObject> | undefined {
    return this.sources.find(e => e.alias === alias)?.source;
  }

  public isEmpty(): boolean {
    return this.sources.length === 0;
  }

  public entries(): AsyncDataSource<AnyObject>[] {
    return this.sources.map(e => e.source);
  }

  public merge(): AsyncDataSource<AnyObject>[] {
    let datasources: AsyncDataSource<AnyObject>[] = [];
    for (const ds of this.sources) {
      datasources = datasources.concat(ds.source);
    }

    return datasources;
  }
}
