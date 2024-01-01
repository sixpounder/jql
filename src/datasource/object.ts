import { isNull } from "lodash-es";
import { QueryFilterProtocol } from "../filter";
import { DataSource } from "./prelude";
import { project } from "./internals";

export class ObjectQueryDatasource<T extends object>
implements DataSource<T> {
    constructor(private source: T, ..._args: any[]) {}
    
    async entries<U extends keyof T>(filter: QueryFilterProtocol | null, projection?: Array<U>):
        Promise<Iterable<Pick<T, U>>> {

        return !isNull(filter)
            ? await filter.apply(this.source)
                ? [project(this.source, projection)]
                : []
            : [project(this.source, projection)];
    }
}
