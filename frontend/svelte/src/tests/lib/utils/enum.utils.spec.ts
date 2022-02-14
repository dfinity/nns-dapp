import { enumKeys, enumsKeys, enumValues } from "../../../lib/utils/enum.utils";

describe("enum-utils", () => {
  enum TestEnum {
    A = 0,
    B = 1,
    C = 2,
    D = 3,
  }

  it("should return the values of the enum", () => {
    expect(enumValues(TestEnum)).toEqual([0, 1, 2, 3]);
  });

  it("should return the keys of the enum", () => {
    expect(enumKeys(TestEnum)).toEqual(["A", "B", "C", "D"]);
  });

  it("should return the keys of a subset of enums", () => {
    // TODO: if someone knows how to solve "Type 'typeof TestEnum' is not assignable to type 'TestEnum'." ping me!
    expect(
      enumsKeys<TestEnum>({
        obj: TestEnum as unknown as TestEnum,
        values: [TestEnum.B, TestEnum.C],
      })
    ).toEqual(["B", "C"]);
  });
});
