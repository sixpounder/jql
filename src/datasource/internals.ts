import { get, isEmpty, set } from "lodash";
import { AnyObject } from "./prelude";

export function project<T, U extends keyof T>(obj: T, projection: Array<U>) {
    if (isEmpty(projection)) {
        return obj;
    }

    const projectedObject: AnyObject = {};
    for (let index = 0; index < projection.length; index++) {
        const proj = projection[index];
        set(projectedObject, proj, get(obj, proj, null));
    }

    return projectedObject as Pick<T, U>;
}
