import { compact, get, hasIn, isEmpty, isNil, isRegExp, isString, isUndefined } from "lodash-es";
import { isElement } from "../../inspection";

const TAGNAME_PROP = "tagName";

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
export const tagName = (...expected: string[]): (el: any) => boolean => {
  return (el) => {
    const compactExpected = compact(expected);
    if (isNil(compactExpected) || isEmpty(compactExpected)) {
      return false;
    }

    // Check if el is an `Element` because that's faster than checking for own or
    // inherited properties, only do that is that's necessary
    if (isElement(el) || hasIn(el, TAGNAME_PROP)) {
      const prop = get(el, TAGNAME_PROP);
      if (isString(prop)) {
        return !isUndefined(compactExpected.find(t => t.toLowerCase() === prop.toLowerCase()));
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
 * 
 * # Example
 * 
 * ```typescript
 * select().from("document").where(hasClass("foo")).run() // [{ tagName: "DIV", ... }, ...]
 * 
 * select().from("document").where(hasClass("foo", "bar")).run() // [{ tagName: "DIV", ... }, ...]
 * ```
 */
export const hasClass = (...klass: string[]): (el: any) => boolean => {
  return (el) => {
    if (!isElement(el)) {
      return false;
    }

    return klass.reduce((acc, currentClass) => {
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
 * @returns The built predicate. Note that the returned predicate only works on DOM elements. If the provided input
 * is not an `Element` this will always evaluate to `false`.
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
 * @param expected - The value of the property (optional)
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
 * 
 * select().from({ name: "Some value" }).where(prop("name", /^Some/)).run() // [{ name: "Some value" }]
 * ```
 */
export const prop = (name: string, expected?: any): (el: any) => boolean => {
  return (el) => {
    if (isNil(expected)) {
      return hasIn(el, name);
    } else {
      const value = get(el, name, null);
      if (isRegExp(expected)) {
        return expected.test(value);
      } else {
        return value === expected;
      }
    }
  }
}

/**
 * Asserts that a property with name `name` is present in the element being evaluated and has a null-ish value
 * @param name - The name of the property
 * @returns The built predicate
 * 
 * # Example
 * 
 * ```typescript
 * const sample = [{ a: 1 }, { a: 2 }, { a: null }];
 * const result = await select().from(sample).where(isNotNull("a")).run();
 * // result -> [{ a: 1 }, { a: 2 }]
 * ```
 */
export const isNull = (name: string): (el: any) => boolean => {
  return (el) => {
    return isNil(get(el, name));
  }
}

/**
 * Asserts that a property with name `name` is present in the element being evaluated and has a non null-ish value
 * @param name - The name of the property
 * @returns The built predicate
 * 
 * # Example
 * 
 * ```typescript
 * const sample = [{ a: 1 }, { a: 2 }, { a: null }];
 * const result = await select().from(sample).where(isNotNull("a")).run();
 * // result -> [{ a: 1 }, { a: 2 }]
 * ```
 */
export const notNull = (name: string): (el: any) => boolean => {
  return (el) => {
    return !isNil(get(el, name));
  }
}
