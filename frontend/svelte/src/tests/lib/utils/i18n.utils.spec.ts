import { replacePlaceholders, translate } from "../../../lib/utils/i18n.utils";

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

  describe("replacePlaceholders", () => {
    it("should replace single placeholder", () => {
      expect(replacePlaceholders("Hello this!", { this: "World" })).toBe(
        "Hello World!"
      );
    });

    it("should replace multiple occurances", () => {
      expect(
        replacePlaceholders(
          "Bow wow wow yippie yo yippie yay... Where my dogs at?",
          {
            wow: "quack",
            dogs: "ducks",
          }
        )
      ).toBe("Bow quack quack yippie yo yippie yay... Where my ducks at?");
    });

    it("should return the original text if nothing to replace", () => {
      expect(
        replacePlaceholders("Lorem Ipsum!", {
          $1: "World",
          Why: "Hello",
          "?": "!",
        })
      ).toBe("Lorem Ipsum!");
    });

    it("should escape regexp special characters in placeholder values", () => {
      expect(
        replacePlaceholders("^.*$1$2?[%]^|/{1}", {
          "^.*": "The ",
          $1: "quick ",
          $2: "brown ",
          "?": "fox ",
          "[%]": "jumps ",
          "^": "over ",
          "|": "the ",
          "/": "lazy ",
          "{1}": "dog",
        })
      ).toBe("The quick brown fox jumps over the lazy dog");
    });
  });
});
