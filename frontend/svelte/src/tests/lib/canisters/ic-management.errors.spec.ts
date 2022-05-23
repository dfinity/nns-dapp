import { toHttpError } from "../../../lib/canisters/ic-management/ic-management.errors";

describe("IC Management Error utils", () => {
  describe("toHttpError", () => {
    it("extracts status code from the error after break line", () => {
      expect(toHttpError(new Error("code: 501")).code).toBe(501);
      expect(
        toHttpError(new Error("This is an error message with\ncode: 514")).code
      ).toBe(514);
      expect(
        toHttpError(new Error("And this is yet another one with\ncode: 509"))
          .code
      ).toBe(509);
    });

    it("returns 500 if no code is found", () => {
      expect(toHttpError(new Error("no code is found here")).code).toBe(500);
      expect(
        toHttpError(new Error("erro message with code: 509 in the same line"))
          .code
      ).toBe(500);
    });
  });
});
