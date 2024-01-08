/**
 * @jest-environment jsdom
 */

import { and, not } from "../src/filter";
import { select } from "../src/query";
import { attr, hasClass, prop, tagName } from "../src/filter/builtin";

const someDiv = document.createElement("div");
someDiv.classList.add("sheep");
someDiv.setAttribute("data-fold", "32");
document.body.appendChild(someDiv);

const someOtherDiv = document.createElement("div");
someOtherDiv.classList.add("leet");
someOtherDiv.setAttribute("data-fold", "1");
document.body.appendChild(someOtherDiv);

describe("Testing hasClass filter", () => {
  test("contract", () => {
    expect(hasClass("leet")({})).toBe(false);
    expect(hasClass("leet")(document.querySelector("div.leet") as Element)).toBe(true);
    expect(hasClass("leet")(document.body)).toBe(false);
    expect(hasClass("foo")("My name is Inigo Montoya" as unknown as Element)).toBe(false);
    expect(hasClass("foo")(0 as unknown as Element)).toBe(false);
    expect(hasClass("foo")({} as Element)).toBe(false);
  });

  test("query", async () => {

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
});

describe("Testing attr filter", () => {
  test("contract", () => {
    expect(attr("data-fold")({})).toBe(false);
    expect(attr("data-fold", "anyValue")({})).toBe(false);

    expect(attr("data-fold")(document.querySelector("div.leet") as Element)).toBe(true);
    expect(attr("data-fold", "1")(document.querySelector("div.leet") as Element)).toBe(true);
    expect(attr("data-fold", "1")(document.body)).toBe(false);
    expect(attr("data-fold", "1")("My name is Inigo Montoya" as unknown as Element)).toBe(false);
    expect(attr("data-fold", "1")(0 as unknown as Element)).toBe(false);
    expect(attr("data-fold", "1")({} as Element)).toBe(false);
  });

  test("query", async () => {

    const queryResult = await select("*")
      .from(document)
      .where(
        and(
          attr("data-fold", "1"),
          not(attr("data-fold", "32"))
        )
      )
      .run();
        
    expect(queryResult).toBeInstanceOf(Array);
    expect(queryResult).toHaveLength(1);

    const queryResult2 = await select("*")
      .from(document)
      .where(attr("data-fold"))
      .run();
        
    expect(queryResult2).toBeInstanceOf(Array);
    expect(queryResult2).toHaveLength(2);
  });
});

describe("Testing tagName filter", () => {
  test("contract", () => {
    expect(tagName("div")(document.querySelector("div.leet") as Element)).toBe(true);
    expect(tagName("a")(document.body)).toBe(false);
    expect(tagName("a")("My name is Inigo Montoya" as unknown as Element)).toBe(false);
    expect(tagName("a")(0 as unknown as Element)).toBe(false);
    expect(tagName("a")({} as Element)).toBe(false);
  });

  test("query", async () => {

    const queryResult = await select("*")
      .from(document)
      .where(
        and(
          tagName("div"),
          not(tagName("body"))
        )
      )
      .run();
        
    expect(queryResult).toBeInstanceOf(Array);
    expect(queryResult).toHaveLength(2);
  });
});

describe("Testing prop filter", () => {
  test("contract", () => {
    const testObject = { p1: "test", p2: "object" };

    expect(prop(null as unknown as string)(testObject)).toBe(false);

    expect(prop("test")(null)).toBe(false);
    expect(prop("test", "anyValue")(null)).toBe(false);
    expect(prop("test")(undefined)).toBe(false);
    expect(prop("test", "anyValue")(undefined)).toBe(false);

    expect(prop("test")(testObject)).toBe(false);
    expect(prop("p1")(testObject)).toBe(true);
    expect(prop("p1", "foo")(testObject)).toBe(false);
    expect(prop("p1", "test")(testObject)).toBe(true);
  });
});