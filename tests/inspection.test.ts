/**
 * @jest-environment jsdom
 */
import { isElement, isPromise, promisify } from "../src/inspection";

describe("Testing inspection library", () => {
  test("isElement", () => {
    const someDiv = document.createElement("div");
    someDiv.classList.add("wolf");
    document.body.appendChild(someDiv);

    expect(isElement(someDiv)).toBe(true)
    expect(isElement({})).toBe(false)
    expect(isElement("Wassaaaap")).toBe(false)
  })

  test("isPromise", () => {
    expect(isPromise(console.log)).toBe(false);
    expect(isPromise(Promise.resolve("inigo montoya"))).toBe(true);
  })

  test("promisify", () => {
    const notAPromise = () => "inigo montoya"
    expect(isPromise(notAPromise)).toBe(false);

    const promisified = promisify(notAPromise)
    expect(isPromise(promisified("inigo montoya"))).toBe(true);
  })

  test("promisify (reject)", () => {
    const promisified = promisify(() => { throw new Error("Prepare to die") });
    expect(promisified()).rejects.toThrow("Prepare to die");
  })
})