import { get, isNull, set } from "lodash";
import { QueryFilterProtocol } from "../filter";
import { AnyObject, DataSource } from "./prelude";
import { project } from "./internals";

export class ArrayQueryDatasource<T extends object> implements DataSource<T> {
    constructor(private source: AnyObject[], ..._args: any[]) {}

    async entries<U extends keyof T>(filter: QueryFilterProtocol | null, projection: Array<U>):
        Promise<Iterable<Pick<T, U>>> {
        
        const pickResult = (element: AnyObject) => {
            const projectedObject: AnyObject = {};
            for (let index = 0; index < projection.length; index++) {
                const proj = projection[index];
                set(projectedObject, proj, get(element, proj, null));
            }

            return projectedObject as Pick<T, U>;
        }
        
        const filteredElements: Pick<T, U>[] = [];
        for (let index = 0; index < this.source.length; index++) {
            const element = this.source[index];
            if (!isNull(filter)) {
                if (await filter.apply(element)) {
                    filteredElements.push(pickResult(project(element, projection)));
                }
            } else {
                filteredElements.push(project(element, projection) as Pick<T, U>);
            }
        }

        return filteredElements;
    }
}
