import { ObjectDatasource, innerJoin } from "../src/datasource";
import { AsyncDataSource } from "../src/datasource/prelude";
import { select } from "../src/query";

describe("Testing JOINS", () => {
  test("Inner join objects", async () => {

    const ds1: AsyncDataSource<{id: number}> = new ObjectDatasource({ id: 1});
    const ds2: AsyncDataSource<{fk: number}> = new ObjectDatasource({ fk: 1});

    const result = await select("*")
      .from(innerJoin(ds1, ds2, (a, b) => a.id === b.fk)).run();

    expect(result).toHaveLength(1);
  })
});