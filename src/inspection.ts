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
