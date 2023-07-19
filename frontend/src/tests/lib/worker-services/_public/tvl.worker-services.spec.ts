import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import * as tvlApi from "$lib/worker-api/tvl.worker-api";
import { queryTVL } from "$lib/worker-services/$public/tvl.worker-services";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("tvl services", () => {
  const params = {
    ...ACTOR_PARAMS,
    tvlCanisterId: TVL_CANISTER_ID.toText(),
  };

  beforeEach(() =>
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  );

  const result = {
    tvl: 1n,
    time_sec: 0n,
  };

  it("should get tvl", async () => {
    const spyQueryTVL = vi
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
    vi.spyOn(tvlApi, "queryTVL").mockImplementation(async () => {
      throw new Error("test");
    });

    const result = await queryTVL(params);

    expect(result).toBeUndefined();
  });
});
