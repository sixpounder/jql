import { has } from "lodash";
import { ArrayDatasource, rightJoin } from "../src/datasource";
import { AsyncDataSource } from "../src/datasource/prelude";
import { select } from "../src/query";

describe("Testing Right Join", () => {
  test("Right join collections and respect projection", async () => {

    const ds1: AsyncDataSource<{id: number}> = new ArrayDatasource([{ id: 1 }, { id: 2 }, { id: 3 }])
    const ds2: AsyncDataSource<{fk: number, data: string }> = new ArrayDatasource([
      { fk: 1, data: "First entry" },
      { fk: 2, data: "Second entry" }
    ]);
    
    const result = await select("id", "data")
      .from(rightJoin(ds1, ds2, (a, b) => a.id === b.fk)).run();
    
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("data", "First entry");
    expect(result[1]).toHaveProperty("data", "Second entry");
    result.forEach(entry => expect(has(entry, "fk")).toBeFalsy());
  })
});