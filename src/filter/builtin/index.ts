import { get, has, isString, isUndefined } from "lodash-es";
import { isElement } from "../../inspection";

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

export const prop = (name: string, val?: string): (el: any) => boolean => {
    return (el) => {
        if (isUndefined(val)) {
            return has(el, name);
        } else {
            return get(el, name, null) === val;
        }
    }
}