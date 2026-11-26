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
    test("Multiple conditions", async () => {
        const sample = [{a: 1, b: "foo"}, {a: 2, b: "bar"}];

        const result = await select()
            .from(sample)
            .having(prop("a", 1), prop("b", "foo"))
            .run();

        expect(result).toBeTruthy();
        expect(result).toHaveLength(1);

        const result2 = await select()
            .from(sample)
            .having(prop("a", 1), prop("b", "bar"))
            .run();

        expect(result2).toBeTruthy();
        expect(result2).toHaveLength(0);
    })
});