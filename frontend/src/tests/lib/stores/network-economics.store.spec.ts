import { get } from "svelte/store";
import { networkEconomicsStore } from "../../../lib/stores/network-economics.store";
import { mockNetworkEconomics } from "../../mocks/network-economics.mock";

describe("network-economics-store", () => {
  it("should set parameters", () => {
    expect(get(networkEconomicsStore)).toEqual({
      parameters: undefined,
      certified: undefined,
    });

    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });

    expect(get(networkEconomicsStore)).toEqual({
      parameters: mockNetworkEconomics,
      certified: true,
    });
  });
});
