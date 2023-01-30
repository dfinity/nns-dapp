import { mapIcrcTokenMetadata } from "$lib/utils/icrc.utils";
import { mockQueryTokenResponse } from "../../mocks/sns-projects.mock";

describe("icrc.utils", () => {
  describe("mapIcrcTokenMetadata", () => {
    it("should return token", () => {
      const token = mapIcrcTokenMetadata(mockQueryTokenResponse);
      expect(token?.name).toBeDefined();
      expect(token?.symbol).toBeDefined();
    });
  });
});
