import * as api from "$lib/api/governance.api";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import {
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
import * as authServices from "$lib/services/auth.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronsPo } from "$tests/page-objects/NnsNeurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronState } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

vi.mock("$lib/api/governance.api");

describe("NnsNeurons", () => {
  const disbursedNeuron = {
    ...mockNeuron,
    state: NeuronState.Dissolved,
    neuronId: 225n,
    fullNeuron: {
      ...mockFullNeuron,
      cachedNeuronStake: 0n,
      maturityE8sEquivalent: 0n,
    },
  };

  const renderComponent = async () => {
    const { container } = render(NnsNeurons);
    await runResolvedPromises();
    return NnsNeuronsPo.under(new JestPageObjectElement(container));
  };

  describe("with enough neurons", () => {
    const mockNeuron2 = {
      ...mockNeuron,
      neuronId: 223n,
    };
    const spawningNeuron = {
      ...mockNeuron,
      state: NeuronState.Spawning,
      neuronId: 224n,
      fullNeuron: {
        ...mockFullNeuron,
        cachedNeuronStake: 0n,
        maturityE8sEquivalent: 10_000_000_000n,
        spawnAtTimesSeconds: 12_312_313n,
      },
    };
    const neurons = [mockNeuron, spawningNeuron, mockNeuron2];

    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockResolvedValue(neurons);
    });

    it("should render the neurons table", async () => {
      const po = await renderComponent();

      expect(await po.getNeuronsTablePo().isPresent()).toBe(true);
    });

    it("should render neurons table rows", async () => {
      const po = await renderComponent();

      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(rows).toHaveLength(3);
    });

    it("should filter out disbursed neurons", async () => {
      vi.spyOn(api, "queryNeurons").mockResolvedValue([
        mockNeuron,
        disbursedNeuron,
        mockNeuron2,
      ]);
      const po = await renderComponent();

      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(rows).toHaveLength(2);
      expect(await rows[0].getStake()).not.toBe("0 ICP");
      expect(await rows[1].getStake()).not.toBe("0 ICP");
    });

    it("should render an go-to-detail button for non-spawning neurons", async () => {
      const po = await renderComponent();

      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(rows).toHaveLength(3);
      expect(neurons).toHaveLength(3);
      expect(await rows[0].getStake()).not.toBe("0 ICP");
      expect(await rows[0].hasGoToDetailButton()).toBe(true);
      expect(await rows[1].getStake()).not.toBe("0 ICP");
      expect(await rows[1].hasGoToDetailButton()).toBe(true);
      // Spawning neuron without stake comes last.
      expect(await rows[2].getStake()).toBe("0 ICP");
      expect(await rows[2].hasGoToDetailButton()).toBe(false);
    });

    it("should provide USD prices", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      vi.spyOn(api, "queryNeurons").mockResolvedValue([
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            cachedNeuronStake: 300_000_000n,
          },
        },
      ]);

      icpSwapTickersStore.set([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "11.00",
        },
      ]);

      const po = await renderComponent();

      // The neuron has a stake of 3 ICP.
      // There are 11 USD in 1 ICP.
      // So the stake is $33.
      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(await rows[0].getStakeInUsd()).toBe("$33.00");
    });

    it("should not show total USD value banner when feature flag is disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", false);

      const po = await renderComponent();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(false);
    });

    it("should show total USD value banner when feature flag is enabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      const po = await renderComponent();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
    });

    it("should show total stake in USD", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

      vi.spyOn(api, "queryNeurons").mockResolvedValue([
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            cachedNeuronStake: 300_000_000n,
          },
        },
      ]);

      icpSwapTickersStore.set([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "11.00",
        },
      ]);

      const po = await renderComponent();

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
      expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$33.00");
      expect(
        await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
      ).toBe(false);
    });

    it("should display `Missing rewards` tag", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);
      overrideFeatureFlagsStore.setFlag(
        "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
        true
      );
      networkEconomicsStore.setParameters({
        parameters: mockNetworkEconomics,
        certified: true,
      });
      vi.spyOn(api, "queryNeurons").mockResolvedValue([
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            votingPowerRefreshedTimestampSeconds: BigInt(
              nowInSeconds() - SECONDS_IN_YEAR
            ),
          },
        },
      ]);

      const po = await renderComponent();
      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(await rows[0].getTags()).toEqual(["Missing rewards"]);
    });
  });

  describe("LosingRewardsBanner", () => {
    beforeEach(() => {
      resetIdentity();
      vi.spyOn(api, "queryNeurons").mockResolvedValue([
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            votingPowerRefreshedTimestampSeconds: BigInt(
              nowInSeconds() - SECONDS_IN_HALF_YEAR
            ),
          },
        },
      ]);
      networkEconomicsStore.setParameters({
        parameters: mockNetworkEconomics,
        certified: true,
      });
    });

    it("should not display LosingRewardsBanner by default", async () => {
      const po = await renderComponent();
      // It should be behind the feature flag
      expect(await po.getLosingRewardsBannerPo().isPresent()).toBe(false);
    });

    it("should display LosingRewardsBanner", async () => {
      overrideFeatureFlagsStore.setFlag(
        "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
        true
      );
      const po = await renderComponent();

      expect(await po.getLosingRewardsBannerPo().isPresent()).toBe(true);
      expect(await po.getLosingRewardsBannerPo().isVisible()).toBe(true);
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockResolvedValue([]);
    });

    it("should render an empty message", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(true);
    });

    it("should render an empty message with disbursed neurons", async () => {
      vi.spyOn(api, "queryNeurons").mockResolvedValue([disbursedNeuron]);
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(true);
    });
  });

  describe("while loading", () => {
    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockReturnValue(
        new Promise(() => {
          // Don't resolve the promise to keep the component in loading state.
        })
      );
    });

    it("should render a spinner", async () => {
      const po = await renderComponent();

      expect(await po.hasSpinner()).toBe(true);
    });

    it("should not render an empty message", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(false);
    });
  });

  describe("navigating", () => {
    beforeEach(() => {
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      vi.spyOn(api, "queryNeurons").mockResolvedValue([]);
    });

    it("should call query neurons twice when rendered", async () => {
      await renderComponent();

      await waitFor(() =>
        expect(api.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: true,
          includeEmptyNeurons: false,
        })
      );
      expect(api.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
        includeEmptyNeurons: false,
      });
    });

    it("should NOT call query neurons after being visited", async () => {
      await renderComponent();

      await waitFor(() =>
        expect(api.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: true,
          includeEmptyNeurons: false,
        })
      );
      expect(api.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
        includeEmptyNeurons: false,
      });

      await renderComponent();

      // We wait to make sure there are no more calls
      await tick();
      await tick();
      await tick();

      await waitFor(() => expect(api.queryNeurons).toHaveBeenCalledTimes(2));
    });
  });
});
