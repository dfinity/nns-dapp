import * as tvlApi from "$lib/api/tvl.api.cjs";
import { queryTVL } from "$lib/services/$public/tvl.service";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("tvl services", () => {
  beforeEach(() =>
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  );

  const result = {
    tvl: 1n,
    time_sec: 0n,
  };

  it("should get tvl", async () => {
    const spyQueryTVL = vi.spyOn(tvlApi, "queryTVL").mockResolvedValue(result);

    await queryTVL();

    await waitFor(() =>
      expect(spyQueryTVL).toBeCalledWith({
        identity: new AnonymousIdentity(),
        certified: false,
      })
    );
  });

  it("should not bubble error but return undefined", async () => {
    vi.spyOn(tvlApi, "queryTVL").mockImplementation(async () => {
      throw new Error("test");
    });

    const result = await queryTVL();

    expect(result).toBeUndefined();
  });
});
