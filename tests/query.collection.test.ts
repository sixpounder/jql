import { isNull, notNull, prop } from "../src/filter/builtin";
import { select } from "../src/query";

describe("Testing on collections", () => {
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

  test("Query simple collection with type checking", async () => {
    interface ElementType { a: number }
    const sample = [{a: 1}, {a: 2}];

    const result = await select().from(sample).where((el: ElementType) => el.a === 1).run();

    expect(result).toBeTruthy();
    expect(result).toHaveLength(1);
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

  test("Query with nested props filter / projection", async () => {
    const sample = [{
      parent: {
        a: 1,
        b: {
          c: 2
        }
      }
    }, {
      some: {
        prop: 1,
        some: {
          prop: 2
        }
      }
    }];

    const result = await select("parent.a").from(sample).run();

    expect(result).toBeTruthy();
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("parent.a", 1);
    expect(result[1]).toHaveProperty("parent.a", null);

    const result2 = await select("parent.a").from(sample).where(prop("parent.b.c", 2)).run();

    expect(result2).toBeTruthy();
    expect(result2).toHaveLength(1);
    expect(result2[0]).toHaveProperty("parent.a");
  });
});