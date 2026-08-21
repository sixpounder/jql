import { prop } from "../src/filter";
import { select } from "../src/query";

describe("Testing Having Filters", () => {
    test("Simple case", async () => {
        const sample = [{a: 1}, {a: 2}];

        const result = await select()
            .from(sample)
            .having(prop("a", 1))
            .run();

        expect(result).toBeTruthy();
        expect(result).toHaveLength(1);
    })
});