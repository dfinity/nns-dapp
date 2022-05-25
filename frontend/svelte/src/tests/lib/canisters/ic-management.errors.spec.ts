import {
  mapError,
  UserNotTheControllerError,
} from "../../../lib/canisters/ic-management/ic-management.errors";

describe("IC Management Error utils", () => {
  describe("mapError", () => {
    it("returns error based on code", () => {
      expect(mapError(new Error("code: 403"))).toBeInstanceOf(
        UserNotTheControllerError
      );
      expect(
        mapError(new Error("This is an error message with\ncode: 514"))
      ).toBeInstanceOf(Error);
      expect(
        mapError(new Error("And this is yet another one with\ncode: 509"))
      ).toBeInstanceOf(Error);
    });

    it("returns Error if no code is found", () => {
      expect(mapError(new Error("no code is found here"))).toBeInstanceOf(
        Error
      );
      expect(
        mapError(new Error("erro message with code: 509 in the same line"))
      ).toBeInstanceOf(Error);
    });
  });
});
