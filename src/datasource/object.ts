import { AnyFilter } from "../filter";
import { QueryDataSource } from "./prelude";

export class ObjectQueryDatasource implements QueryDataSource<Record<string | number | symbol, unknown>> {
    private dsAlias: string | null = null;

    constructor (private source: Record<string | number | symbol, unknown>, ..._args: any[]) {}
    
    entries (_fitler: AnyFilter): [Record<string | number | symbol, unknown>[], boolean] {
        return [[this.source], false]
    }
}
