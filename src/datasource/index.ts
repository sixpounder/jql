import { isString } from "lodash-es";
import { ObjectQueryDatasource, ArrayQueryDatasource } from ".";
import { isParentNode } from "../inspection";
import { DocumentQueryDatasource } from "./dom";
import { AnyObject, AnyRawDataSource, DataSource } from "./prelude";

export * from "./array";
export * from "./dom";
export * from "./object";

export const datasource = (value: AnyRawDataSource, ...args: any[]): DataSource<AnyObject> => {
  if (isParentNode(value)) {
    return new DocumentQueryDatasource(value, args[0] ?? "*");
  } else if (Array.isArray(value)) {
    return new ArrayQueryDatasource(value, ...args);
  } else if (isString(value)) {
    return DocumentQueryDatasource.fromString(value) ?? new DocumentQueryDatasource(document, "*");
  } else {
    return new ObjectQueryDatasource(value, ...args);
  }
}

export class DatasourceRepository {
  private sources: { alias: string | null, source: DataSource<AnyObject> }[] = [];

  public add(source: AnyRawDataSource): void;
  public add(source: AnyRawDataSource, alias?: string): void {
    this.sources.push({
      alias: alias ?? null,
      source: datasource(source)
    });
  }

  public get(alias: string): DataSource<AnyObject> | undefined {
    return this.sources.find(e => e.alias === alias)?.source;
  }

  public isEmpty(): boolean {
    return this.sources.length === 0;
  }

  public entries(): DataSource<AnyObject>[] {
    return this.sources.map(e => e.source);
  }

  public merge(): DataSource<AnyObject>[] {
    let datasources: DataSource<AnyObject>[] = [];
    for (const ds of this.sources) {
      datasources = datasources.concat(ds.source);
    }

    return datasources;
  }
}
