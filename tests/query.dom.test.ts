/**
 * @jest-environment jsdom
 */

import { and, not, or } from "../src/filter";
import { select } from "../src/query";
import { hasClass } from "../src/filter/builtin";
import { sleep } from "./utils";

const someDiv = document.createElement("div");
someDiv.classList.add("sheep");
document.body.appendChild(someDiv);

const someOtherDiv = document.createElement("div");
someOtherDiv.classList.add("leet");
document.body.appendChild(someOtherDiv);

describe("Testing JSQuery", () => {
    test("DOM select * from *", async () => {

        const queryResult = await select("*")
            .from(document)
            .run();

        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(5);

        const queryResult2 =
        await select("*")
            .from("document.div")
            .where(hasClass("sheep"))
            .run();
        
        expect(queryResult2).toBeInstanceOf(Array);
        expect(queryResult2).toHaveLength(1);
    });

    test("Single condition queries by classList", async () => {

        const queryResult = await select("div")
            .from(document)
            .where(node => {
                return node.classList.contains("wolf");
            })
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(0);

        const queryResult2 = await select("*")
            .from("document.div")
            .where(node => node.classList.contains("sheep"))
            .run();
        
        expect(queryResult2).toBeInstanceOf(Array);
        expect(queryResult2).toHaveLength(1);
    });

    test("Single async condition", async () => {
        const queryResult = await select("div")
            .from(document)
            .where(async node => {
                await sleep(100);
                return node.classList.contains("sheep");
            })
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);
    }, 10000);

    test("Multiple condition queries (intersection)", async () => {

        const queryResult = await select("div")
            .from(document)
            .where(
                and(
                    not(hasClass("wolf")),
                    hasClass("sheep")
                )
            )
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);
    });

    test("Multiple condition queries (union)", async () => {

        const queryResult = await select("div")
            .from(document)
            .where(
                not(node => node.classList.contains("wolf")),
                or(
                    node => node.classList.contains("leet"),
                    node => node.classList.contains("sheep")
                )
            )
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(2);
    });

    test("Multiple projection", async () => {
        const queryResult = await select("*")
            .from("document.div,a")
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(2);
        expect(queryResult[0].tagName).toBe("DIV");
        expect(queryResult[1].tagName).toBe("DIV");
    });

    test("Limit / Offset", async () => {
        const queryResult = await select("tagName")
            .from("document.div")
            .limit(1)
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);
        expect(queryResult[0].tagName).toBe("DIV");

        const queryResult2 = await select("tagName")
            .from(document)
            .limit(1)
            .offset(1)
            .run();
        
        expect(queryResult2).toBeInstanceOf(Array);
        expect(queryResult2).toHaveLength(1);
        expect(queryResult2[0].tagName).toBe("HEAD");

        const queryResult3 = await select("div, a")
            .from(document)
            .offset(23) // Way out of index
            .run();
        
        expect(queryResult3).toBeInstanceOf(Array);
        expect(queryResult3).toHaveLength(0);
    });
});
