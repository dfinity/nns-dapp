import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger-icrc";
import { mockQueryTokenResponse, mockSnsToken } from "./sns-projects.mock";

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

    it("should return token with decimals and logo", () => {
      const logo = "data:image/svg+xml;base64...";
      const token = mapOptionalToken([
        ...mockQueryTokenResponse,
        [IcrcMetadataResponseEntries.LOGO, { Text: logo }],
      ]);
      expect(token).toEqual({
        ...mockSnsToken,
        decimals: 8,
        logo,
      });
    });
  });
});
