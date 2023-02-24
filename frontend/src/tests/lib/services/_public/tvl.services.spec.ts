/**
 * @jest-environment jsdom
 */

import * as tvlApi from "$lib/api/tvl.api";
import { queryTVL } from "$lib/services/$public/tvl.service";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";

describe("tvl services", () => {
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
      })
    );
  });
});
