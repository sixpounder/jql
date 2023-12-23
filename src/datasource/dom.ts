import { isNull } from "lodash";
import { QueryFilterProtocol } from "../filter";
import { DataSource } from "./prelude";
import { project } from "./internals";

export class DocumentQueryDatasource implements DataSource<Element> {
    public static matchDocumentQueryString(value: string): RegExpMatchArray | null {
        return value.match(/document\.(.*)/);
    }

    public static fromString(value: string): DocumentQueryDatasource | null {
        const matched = DocumentQueryDatasource.matchDocumentQueryString(value);
        if (matched?.length) {
            return new DocumentQueryDatasource(document, matched[1]);
        } else {
            return null;
        }
    }

    constructor(private source: ParentNode, private selector: string) {}

    async entries<U extends keyof Element>(filter: QueryFilterProtocol | null, projection: Array<U>):
    Promise<Iterable<Pick<Element, U>>> {
        
        const pickResults = async (elements: NodeList, filter: QueryFilterProtocol, projection: Array<U>) => {
            const filteredOutput: Array<Pick<Element, U>> = [];
            for (let index = 0; index < elements.length; index++) {
                const element = elements.item(index) as Node;
                if (await filter.apply(element)) {
                    filteredOutput.push(project(element as unknown as Element, projection));
                }
            }

            return filteredOutput;
        };

        return isNull(filter)
            ? this.source.querySelectorAll(this.selector)
            : await pickResults(this.source.querySelectorAll(this.selector), filter, projection);
    }
}
