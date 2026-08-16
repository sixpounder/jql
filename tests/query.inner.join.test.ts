import { has } from "lodash";
import { ArrayDatasource, ObjectDatasource, innerJoin } from "../src/datasource";
import { AsyncDataSource } from "../src/datasource/prelude";
import { select } from "../src/query";

describe("Testing Inner Join", () => {
  test("Inner join objects", async () => {

    const ds1: AsyncDataSource<{id: number}> = new ObjectDatasource({ id: 1});
    const ds2: AsyncDataSource<{fk: number}> = new ObjectDatasource({ fk: 1});

    const result = await select("*")
      .from(innerJoin(ds1, ds2, (a, b) => a.id === b.fk)).run();

    expect(result).toHaveLength(1);
  })

  test("Inner join objects with no intersections", async () => {

    const ds1: AsyncDataSource<{id: number}> = new ObjectDatasource({ id: 1});
    const ds2: AsyncDataSource<{fk: number}> = new ObjectDatasource({ fk: 2});

    const result = await select("*")
      .from(innerJoin(ds1, ds2, (a, b) => a.id === b.fk)).run();

    expect(result).toHaveLength(0);
  })

  test("Inner join collections and respect projection", async () => {

    const ds1: AsyncDataSource<{id: number}> = new ArrayDatasource([{ id: 1 }, { id: 2 }, { id: 3 }])
    const ds2: AsyncDataSource<{fk: number, data: string }> = new ArrayDatasource([
      { fk: 1, data: "First entry" },
      { fk: 2, data: "Second entry" }
    ]);

    const result = await select("id", "data")
      .from(innerJoin(ds1, ds2, (a, b) => a.id === b.fk)).run();

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("data", "First entry");
    expect(result[1]).toHaveProperty("data", "Second entry");
    result.forEach(entry => expect(has(entry, "fk")).toBeFalsy());
  })

  test("Inner join mixed datasources", async () => {

    const ds1: AsyncDataSource<{id: number}> = new ObjectDatasource({ id: 1, someProp: "SomeValue" })
    const ds2: AsyncDataSource<{fk: number, data: string }> = new ArrayDatasource([
      { fk: 1, data: "First entry" },
      { fk: 2, data: "Second entry" }
    ]);

    const result = await select("id", "data")
      .from(innerJoin(ds1, ds2, (a, b) => a.id === b.fk)).run();

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("data", "First entry");
    result.forEach(entry => expect(has(entry, "fk")).toBeFalsy());
  })
});