import { isUndefined } from "lodash";
import { isElement } from "../../inspection";

export const tagName = (name: string | string[]): (el: Element) => boolean => {
    return (el) => {
        if (!isElement(el)) {
            return false;
        }
        
        const tname = el.tagName.toLowerCase();
        if (Array.isArray(name)) {
            return name.find(t => t.toLowerCase() === tname) !== undefined;
        } else {
            return tname === name.toLowerCase();
        }
    }
}

export const hasClass = (klass: string | string[]): (el: Element) => boolean => {
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

export const attr = (attr: string, val?: string): (el: Element) => boolean => {
    return (el) => {
        if (!isElement(el)) {
            return false;
        }

        return isUndefined(val)
            ? el.hasAttribute(attr)
            : el.attributes.getNamedItem(attr)?.value === val ?? false;
    };
}
