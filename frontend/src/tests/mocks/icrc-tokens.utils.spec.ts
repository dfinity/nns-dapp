import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger";
import { mockQueryTokenResponse } from "./sns-projects.mock";

describe("icrc-tokens.utils", () => {
  describe("mapOptionalToken", () => {
    it("should return token", () => {
      const token = mapOptionalToken(mockQueryTokenResponse);
      expect(token?.name).toBeDefined();
      expect(token?.symbol).toBeDefined();
      expect(token?.fee).toBeDefined();
    });

    it("should not return token if name is missing", () => {
      const token = mapOptionalToken(
        mockQueryTokenResponse.filter(
          ([key]) => key !== IcrcMetadataResponseEntries.NAME
        )
      );
      expect(token).toBeUndefined();
    });

    it("should not return token if symbol is missing", () => {
      const token = mapOptionalToken(
        mockQueryTokenResponse.filter(
          ([key]) => key !== IcrcMetadataResponseEntries.SYMBOL
        )
      );
      expect(token).toBeUndefined();
    });

    it("should not return token if fee is missing", () => {
      const token = mapOptionalToken(
        mockQueryTokenResponse.filter(
          ([key]) => key !== IcrcMetadataResponseEntries.FEE
        )
      );
      expect(token).toBeUndefined();
    });
  });
});
