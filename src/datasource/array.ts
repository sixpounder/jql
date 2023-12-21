import { AnyFilter } from "../filter";
import { QueryDataSource } from "./prelude";

export class ArrayQueryDatasource<T> implements QueryDataSource<T> {
    private dsAlias: string | null = null;

    constructor (private source: T[], ..._args: any[]) {}

    entries (_fitler: AnyFilter): [T[], boolean] {
        return [this.source, false];
    }
}
