import { isNull, notNull } from "../src/filter/builtin";
import { select } from "../src/query";

describe("Testing sequel on collections", () => {
  test("Query no collection", async () => {
    const result = await select().from().run();

    expect(result).toBeTruthy();
    expect(result).toHaveLength(0);
  });

  test("Query simple collection", async () => {
    const sample = [{a: 1}, {a: 2}];

    const result = await select().from(sample).run();

    expect(result).toBeTruthy();
    expect(result).toHaveLength(2);
  });

  test("Query simple collection with filtering", async () => {
    const sample = [{a: 1}, {a: 2}, {a: null}];

    const result = await select()
      .from(sample)
      .where(notNull("a"))
      .run();

    expect(result).toBeTruthy();
    expect(result).toHaveLength(2);

    const result2 = await select()
      .from(sample)
      .where(isNull("a"))
      .run();

    expect(result2).toBeTruthy();
    expect(result2).toHaveLength(1);
  });
});