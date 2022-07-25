import { Principal } from "@dfinity/principal";
import { principalToSubAccount } from "../../../lib/canisters/cmc/utils";

describe("Cycles Minting Canister utils", () => {
  describe("principalToSubAccount", () => {
    it("converts succesfully principals to subaccounts", () => {
      const principalEmtpy = Principal.fromText("aaaaa-aa");
      const expectedEmpty = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ]);
      const somePrincipal = Principal.fromText(
        "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
      );
      const someExpected = new Uint8Array([
        29, 78, 150, 68, 71, 62, 255, 180, 205, 67, 110, 236, 26, 156, 140, 8,
        22, 128, 33, 246, 56, 121, 201, 125, 31, 111, 220, 137, 221, 2, 0, 0,
      ]);
      expect(principalToSubAccount(principalEmtpy)).toEqual(expectedEmpty);
      expect(principalToSubAccount(somePrincipal)).toEqual(someExpected);
    });
  });
});
