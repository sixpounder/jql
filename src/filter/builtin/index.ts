import { get, has, isString, isUndefined } from "lodash-es";
import { isElement } from "../../inspection";

/**
 * Returns a predicate that filters based on the `tagName` property of an object
 * @param name - the name to match the `tagName` against
 * @returns - The predicate
 */
export const tagName = (name: string | string[]): (el: any) => boolean => {
    return (el) => {
        let tname: string;
        if (el instanceof Element || has(el, "tagName")) {
            const prop = get(el, "tagName");
            if (isString(prop)) {
                tname = prop.toLowerCase();
            } else {
                return false;
            }
        } else {
            return false;
        }

        if (Array.isArray(name)) {
            return name.find(t => t.toLowerCase() === tname) !== undefined;
        } else {
            return tname === name.toLowerCase();
        }
    }
}

/**
 * Returns a predicate that filter on an `Element` having a specific class in its `classlist`
 * @param klass - the class to find
 * @returns - The predicate
 */
export const hasClass = (klass: string | string[]): (el: any) => boolean => {
    const cls = Array.isArray(klass) ? klass : [klass];
    return (el) => {
        
        if (!isElement(el)) {
            return false;
        }

        return cls.reduce((acc, currentClass) => {
            acc = acc && el.classList.contains(currentClass);
            return acc;
        }, true)
    }
}

/**
 * Returns a predicate that filter on an `Element` having a specific attribute in its attribute list. If a value
 * for that attribute is specified the predicate will also require the attribute's value to match that input value,
 * otherwise the `Element` having that attribute is sufficient.
 * @param attr - The attribute to search for
 * @param val - The attribute value to match against
 * @returns - The predicate
 */
export const attr = (attr: string, val?: string): (el: any) => boolean => {
    return (el) => {
        if (!isElement(el)) {
            return false;
        }

        return isUndefined(val)
            ? el.hasAttribute(attr)
            : el.attributes.getNamedItem(attr)?.value === val ?? false;
    };
}

/**
 * A predicate returning true if an object has a property with a given `name` and, optionally, having a specific `value`
 * @param name - The name of the property
 * @param val - The value of the property (optional)
 * @returns - The predicate
 * 
 * # Example
 * 
 * ```typescript
 * select().from({ a: 1, b: 2}).where(prop("a")).run() // [{ a: 1, a: 2 }]
 * 
 * select().from({ a: 1, b: 2}).where(prop("a", 1)).run() // [{ a: 1, a: 2 }]
 * 
 * select().from({ a: 1, b: 2}).where(prop("a", "hello")).run() // []
 * 
 * select().from({ a: 1, b: 2}).where(prop("c")).run() // []
 * ```
 */
export const prop = (name: string, val?: string): (el: any) => boolean => {
    return (el) => {
        if (isUndefined(val)) {
            return has(el, name);
        } else {
            return get(el, name, null) === val;
        }
    }
}