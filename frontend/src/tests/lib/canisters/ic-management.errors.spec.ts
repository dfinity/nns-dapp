import {
  mapError,
  UserNotTheControllerError,
} from "$lib/canisters/ic-management/ic-management.errors";

describe("IC Management Error utils", () => {
  describe("mapError", () => {
    it("returns error based on error code", () => {
      const notControllerError = new Error(`Call failed:
      Canister: aaaaa-aa
      Method: canister_status (update)
      "Request ID": "9dac7652f94de82d72f00ee492c132defc48da8dd6043516312275ab0fa5b5e1"
      "Error code": "IC0512"
      "Reject code": "5"
      "Reject message": "Only controllers of canister mwewp-s4aaa-aaaaa-qabjq-cai can call ic00 method canister_status"`);
      expect(mapError(notControllerError)).toBeInstanceOf(
        UserNotTheControllerError
      );
      expect(mapError(new Error("code: 403"))).toBeInstanceOf(Error);
      expect(
        mapError(
          new Error(`This is an error message with\n"Error code": "IC0511"`)
        )
      ).toBeInstanceOf(Error);
      expect(
        mapError(
          new Error(`And this is yet another one with\n"Error code": "IC2512"`)
        )
      ).toBeInstanceOf(Error);
    });

    it("returns Error if no code is found", () => {
      expect(mapError(new Error("no code is found here"))).toBeInstanceOf(
        Error
      );
      expect(
        mapError(new Error("erro message with code: IC2512 in the same line"))
      ).toBeInstanceOf(Error);
    });
  });
});
