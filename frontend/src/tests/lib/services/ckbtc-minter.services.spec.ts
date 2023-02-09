/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import * as services from "$lib/services/ckbtc-minter.services";
import { tokensStore } from "$lib/stores/tokens.store";
import { waitFor } from "@testing-library/svelte";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCkBTCAddress } from "../../mocks/ckbtc-accounts.mock";

describe("ckbtc-miniter-services", () => {
  describe("getBTCAddress", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    afterEach(() => jest.clearAllMocks());

    it("should get bitcoin address", async () => {
      const spyGetAddress = jest
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockCkBTCAddress);

      await services.getBTCAddress();

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
        })
      );
    });
  });
});
