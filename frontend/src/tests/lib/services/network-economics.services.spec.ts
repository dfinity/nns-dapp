import * as api from "$lib/api/governance.api";
import { loadNetworkEconomicsParameters } from "$lib/services/network-economics.services";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { get } from "svelte/store";

describe("network-economics-services", () => {
  let spyGetNetworkEconomicsParameters;

  beforeEach(() => {
    resetIdentity();
    spyGetNetworkEconomicsParameters = vi
      .spyOn(api, "getNetworkEconomicsParameters")
      .mockResolvedValue(mockNetworkEconomics);
  });

  describe("loadNetworkEconomicsParameters", () => {
    it("should load network economics", async () => {
      await loadNetworkEconomicsParameters();

      expect(spyGetNetworkEconomicsParameters).toHaveBeenCalledTimes(1);
      expect(spyGetNetworkEconomicsParameters).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: true,
      });
    });

    it("should update networkEconomicsStore store", async () => {
      expect(get(networkEconomicsStore)).toEqual({
        parameters: undefined,
        certified: undefined,
      });

      await loadNetworkEconomicsParameters();

      expect(get(networkEconomicsStore)).toEqual({
        parameters: mockNetworkEconomics,
        certified: true,
      });
    });

    it("should console log on error", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const error = new Error("test error");
      spyGetNetworkEconomicsParameters = vi
        .spyOn(api, "getNetworkEconomicsParameters")
        .mockRejectedValue(error);

      await loadNetworkEconomicsParameters();

      expect(console.error).toBeCalledWith(error);
      expect(console.error).toBeCalledTimes(1);
    });
  });
});
