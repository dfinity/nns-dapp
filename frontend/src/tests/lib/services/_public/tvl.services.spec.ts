/**
 * @jest-environment jsdom
 */

import * as tvlApi from "$lib/api/tvl.api.cjs";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { queryTVL } from "$lib/services/$public/tvl.service";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";

describe("tvl services", () => {
  beforeEach(() =>
    jest.spyOn(console, "error").mockImplementation(() => undefined)
  );

  const result = {
    tvl: 1n,
    time_sec: 0n,
  };

  it("should get tvl", async () => {
    const spyQueryTVL = jest
      .spyOn(tvlApi, "queryTVL")
      .mockResolvedValue(result);

    await queryTVL();

    await waitFor(() =>
      expect(spyQueryTVL).toBeCalledWith({
        identity: new AnonymousIdentity(),
        certified: false,
        canisterId: TVL_CANISTER_ID,
      })
    );
  });

  it("should not bubble error but return undefined", async () => {
    jest.spyOn(tvlApi, "queryTVL").mockImplementation(async () => {
      throw new Error("test");
    });

    const result = await queryTVL();

    expect(result).toBeUndefined();
  });
});
