import {
  mapError,
  UserNotTheControllerError,
} from "$lib/canisters/ic-management/ic-management.errors";

describe("IC Management Error utils", () => {
  describe("mapError", () => {
    it("returns error based on error code", () => {
      const notControllerError = new Error(`Call failed:
        Request ID: f194c3c83afe42c6f4323625bb705490346107bb9fdeac175af8baddc49f9772
        Reject code: 5
        Reject text: Only controllers of canister igbbe-6yaaa-aaaaq-aadnq-cai can call ic00 method canister_status
        Error code: IC0512`);
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
