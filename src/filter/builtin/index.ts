import { get, hasIn, isEmpty, isNull, isString, isUndefined } from "lodash-es";
import { isElement } from "../../inspection";

/**
 * Returns a predicate that filters based on the `tagName` property of an object
 * @param expected - the tag name(s) to match the `tagName` against
 * @returns - A predicate that returns `true` if at least one `expected` name matches the element `tagName`
 * 
 * # Example
 * 
 * ```typescript
 * select().from("document").where(tagName("div")).run() // [{ tagName: "DIV", ... }, ...]
 * ```
 */
export const tagName = (expected: string | string[]): (el: any) => boolean => {
  return (el) => {
    if (isNull(expected) || isUndefined(expected) || isEmpty(expected)) {
      return false;
    }

    // Check if el is an `Element` because that's faster than checking for own or
    // inherited properties, only do that is that's necessary
    if (isElement(el) || hasIn(el, "tagName")) {
      const prop = get(el, "tagName");
      if (isString(prop)) {
        const tname = prop.toLowerCase();

        if (Array.isArray(expected)) {
          return !isUndefined(expected.find(t => t.toLowerCase() === tname));
        } else {
          return tname === expected.toLowerCase();
        }
      } else {
        return false;
      }
    } else {
      return false;
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
 * 
 * # Example
 * 
 * ```typescript
 * 
 * select().from("document").where(attr("src")).run()
 * // [{ tagName: "IMG", src: "***", ... }]
 * 
 * select()
 *   .from("document")
 *   .where(attr("src", "https://some.image.url"))
 *   .run()
 * // [{ tagName: "IMG", src: ""https://some.image.url"", ... }]
 * 
 * ```
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
      return hasIn(el, name);
    } else {
      return get(el, name, null) === val;
    }
  }
}