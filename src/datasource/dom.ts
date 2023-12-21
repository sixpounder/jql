import { AnyFilter } from "../filter";
import { QueryDataSource } from "./prelude";

export class DocumentQueryDatasource implements QueryDataSource<Element> {
    private dsAlias: string | null = null;
    
    public static matchDocumentQueryString (value: string): RegExpMatchArray | null {
        return value.match(/document\.(.*)/);
    }

    public static fromString (value: string): DocumentQueryDatasource | null {
        const matched = DocumentQueryDatasource.matchDocumentQueryString(value);
        if (matched?.length) {
            return new DocumentQueryDatasource(document, matched[1]);
        } else {
            return null;
        }
    }

    constructor (private source: ParentNode, private selector: string) {}

    entries (_fitler: AnyFilter): [Iterable<Element>, boolean] {
        return [this.source.querySelectorAll(this.selector), false]
    }
}
