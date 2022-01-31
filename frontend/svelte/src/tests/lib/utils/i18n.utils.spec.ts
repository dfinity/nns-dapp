import { translate } from "../../../lib/utils/i18n.utils";

describe("i18n-utils", () => {
  it("should translate", () => {
    expect(translate({ labelKey: "core.close" })).toEqual("Close");
  });

  it("should not match translations", () => {
    expect(translate({ labelKey: "core" })).toEqual("core");
    expect(translate({ labelKey: "test" })).toEqual("test");
    expect(translate({ labelKey: "" })).toEqual("");
    expect(translate({ labelKey: "core.test" })).toEqual("core.test");
    expect(translate({ labelKey: "core.test.test" })).toEqual("core.test.test");
  });
});
