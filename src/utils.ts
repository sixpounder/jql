/**
 * Checks if `value` is `null`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * isNull(null)
 * // => true
 *
 * isNull(void 0)
 * // => false
 */
export const isNull = <T>(value: T | null): value is null => {
    return value === null;
}

export const get = <K extends string | number | symbol, T>(value: Record<K, T>, prop: K): T | undefined => {
    return value[prop];
}