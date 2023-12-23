import { get, isNull, set } from "lodash";
import { QueryFilterProtocol } from "../filter";
import { DataSource } from "./prelude";

export class ObjectQueryDatasource<T extends object>
implements DataSource<T> {
    constructor(private source: T, ..._args: any[]) {}
    
    async entries<U extends keyof T>(filter: QueryFilterProtocol | null, projection: Array<U>):
        Promise<Iterable<Pick<T, U>>> {
        
        const pickResult = () => {
            const projectedObject: object = {};
            for (let index = 0; index < projection.length; index++) {
                const proj = projection[index];
                set(projectedObject, proj, get(this.source, proj, null))
            }

            return projectedObject as Pick<T, U>;
        }

        return !isNull(filter)
            ? await filter.apply(this.source)
                ? [pickResult()]
                : []
            : [pickResult()];
    }
}
