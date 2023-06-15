/**
 * @jest-environment jsdom
 */

import * as tvlApi from "$lib/api/tvl.api.cjs";
import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { queryTVL } from "$lib/services/$public/tvl.service";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";

describe("tvl services", () => {
  const params = {
    ...ACTOR_PARAMS,
    tvlCanisterId: TVL_CANISTER_ID.toText(),
  };

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

    await queryTVL(params);

    await waitFor(() =>
      expect(spyQueryTVL).toBeCalledWith({
        identity: new AnonymousIdentity(),
        certified: false,
        ...params,
      })
    );
  });

  it("should not bubble error but return undefined", async () => {
    jest.spyOn(tvlApi, "queryTVL").mockImplementation(async () => {
      throw new Error("test");
    });

    const result = await queryTVL(params);

    expect(result).toBeUndefined();
  });
});
