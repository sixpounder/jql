import { ObjectDatasource } from "../src/datasource/object";
import { and, prop } from "../src/filter";
describe("Testing object datasource adapter", () => {
  test("entries", async () => {
    const ds = new ObjectDatasource({ a: 1, b: 2, c: { d: 1 } });

    expect(await ds.entries()).toStrictEqual([{ a: 1, b: 2, c: { d: 1 } }]);
    expect(await ds.entries(and(prop("b", 1)))).toStrictEqual([]);
    expect(await ds.entries(and(prop("c.d", 1)))).toStrictEqual([{ a: 1, b: 2, c: { d: 1 } }]);
  });
});
