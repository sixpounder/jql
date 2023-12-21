/**
 * Determines if a value is a `String`
 * @param value - The value to inspect
 * @returns - true or false depending on value being a `String` or not. Also does type cohercion.
 */
export const isString = (value: any): value is string => {
    const type = typeof value;
    return (
        type === "string" ||
        (type === "object" &&
            value != null &&
            !Array.isArray(value) &&
            getTag(value) === "[object String]")
    );
}

/**
 * Determines if a value is an `Element`
 * @param value - The value to inspect
 * @returns - true or false depending on value being an `Element` or not. Also does type cohercion.
 */
export const isElement = (value: any): value is Element => {
    return value instanceof Element;
}

/**
 * Determines if a value is a `Promise`
 * @param value - The value to inspect
 * @returns - true or false depending on value being a `Promise` or not. Also does type cohercion.
 */
export const isPromise = (value: any): value is Promise<unknown> => {
    return value instanceof Promise;
}

/**
 * Determines if `value` is a `ParentNode`
 * @param value - the value to inspect
 * @returns - true or false depending on value veing a `ParentNode` or not. Also does type cohercion.
 */
export const isParentNode = (value: any): value is ParentNode => {
    return typeof document !== "undefined" && value instanceof Node && (value as any).querySelectorAll !== undefined;
}

/**
 * Takes a function and wraps it so that a call to it will result in returning a Promise
 * rather than its original return type
 * @param value - the function to transform.
 * @returns - The transformed function
 */
export const promisify = <T>(value: (...args: any[]) => T): (...args: any[]) => Promise<T> => {
    const fn: (...args: any[]) => Promise<T> = (...args: any[]) => {
        return new Promise((resolve, reject) => {
            try {
                resolve(value(...args));
            } catch (e) {
                reject(e);
            }
        });
    };

    return fn;
}

/**
 * Checks if `value` is `undefined`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * isUndefined(void 0)
 * // => true
 *
 * isUndefined(null)
 * // => false
 */
export const isUndefined = (value: any): value is undefined => {
    return value === undefined;
}


function getTag(value: any) {
    if (value == null) {
        return value === undefined ? "[object Undefined]" : "[object Null]"
    }
    return toString.call(value)
}