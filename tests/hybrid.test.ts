/**
 * @jest-environment jsdom
 */

import { and } from "../src/filter";
import { select } from "../src/query";
import { tagName } from "../src/filter/builtin";

const someDiv = document.createElement("div");
someDiv.classList.add("sheep");
document.body.appendChild(someDiv);

const someOtherDiv = document.createElement("div");
someOtherDiv.classList.add("leet");
document.body.appendChild(someOtherDiv);

const testObject = {
    tagName: "DIV",
    description: "I am a regular object"
}

describe("Testing hybrid queries", () => {
    test("Hybrid selection", async () => {
        const result = await select("tagName", "description")
            .from("document.div", testObject)
            .where(and(tagName("DIV")))
            .run();
        expect(result).toHaveLength(3);
        expect(result[2]).toHaveProperty("description", "I am a regular object");
    })
})
