/**
 * @jest-environment jsdom
 */

import { and } from "../src/filter";
import { select } from "../src/query";
import { tagName } from "../src/filter/builtin";
import { SortDirection } from "../src/sort";

const someDiv = document.createElement("div");
someDiv.classList.add("sheep");
document.body.appendChild(someDiv);

const someOtherDiv = document.createElement("div");
someOtherDiv.classList.add("leet");
document.body.appendChild(someOtherDiv);

const testObject = {
  tagName: "DIV",
  description: "I am a regular object",
  priority: 1
}

describe("Testing hybrid queries", () => {
  test("Hybrid selection with no projection", async () => {
    const result = await select("tagName", "description")
      .from("document.div", testObject)
      .run();
    expect(result).toHaveLength(3);
    expect(result[2]).toHaveProperty("description", "I am a regular object");
  })

  test("Hybrid selection", async () => {
    const result = await select("tagName", "description")
      .from("document.div", testObject)
      .where(and(tagName("DIV")))
      .run();
    expect(result).toHaveLength(3);
    expect(result[2]).toHaveProperty("description", "I am a regular object");
  })

  test("Hybrid selection with sorting", async () => {
    const result = await select("tagName", "description")
      .from(document, testObject)
      .where(tagName("DIV"))
      .orderBy("priority", SortDirection.Ascending)
      .orderBy("description")
      .run();
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty("description", "I am a regular object");
  })

  test("Hybrid selection with descending sorting", async () => {
    const result = await select("tagName", "description", "priority")
      .from(document, testObject)
      .where(tagName("DIV"))
      .orderBy("priority", SortDirection.Descending)
      .run();
    expect(result).toHaveLength(3);
    expect(result[2]).toHaveProperty("description", "I am a regular object");
  })
})
