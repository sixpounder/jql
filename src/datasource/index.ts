import { ObjectQueryDatasource } from ".";
import { ArrayQueryDatasource } from ".";
import { isParentNode, isString } from "../inspection";
import { DocumentQueryDatasource } from "./dom";
import { AnyDataSource, AnyRawDataSource, QueryDataSource } from "./prelude";

export * from "./array";
export * from "./dom";
export * from "./object";

export const datasource = (value: AnyRawDataSource, ...args: any[]): QueryDataSource<AnyDataSource> => {
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
    private sources: { alias: string | null, source: QueryDataSource<AnyDataSource> }[] = [];

    public add(source: AnyRawDataSource): void;
    public add (source: AnyRawDataSource, alias?: string): void {
        this.sources.push({
            alias: alias ?? null,
            source: datasource(source)
        });
    }

    public get (alias: string): QueryDataSource<AnyDataSource> | undefined {
        return this.sources.find(e => e.alias === alias)?.source;
    }

    public isEmpty (): boolean {
        return this.sources.length === 0;
    }

    public entries (): QueryDataSource<AnyDataSource>[] {
        return this.sources.map(e => e.source);
    }

    public merge (): QueryDataSource<AnyDataSource>[] {
        let datasources: QueryDataSource<any>[] = [];
        for (const ds of this.sources) {
            datasources = datasources.concat(ds.source);
        }

        return datasources;
    }
}
