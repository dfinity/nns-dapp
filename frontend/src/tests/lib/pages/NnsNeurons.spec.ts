import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as api from "$lib/api/governance.api";
import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
import * as authServices from "$lib/services/auth.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronsPo } from "$tests/page-objects/NnsNeurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronState, NeuronVisibility } from "@dfinity/nns";
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

  beforeEach(() => {
    vi.resetAllMocks();
    resetNeuronsApiService();
    overrideFeatureFlagsStore.reset();
  });

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
  });

  describe("MakeNeuronsVisibilityBanner", () => {
    const privateControlledNeuron = {
      ...mockNeuron,
      visibility: NeuronVisibility.Private,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockMainAccount.principal.toText(),
      },
    };
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01"));
      vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
        mockIdentity
      );
      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [],
      });
      vi.spyOn(api, "queryNeurons").mockResolvedValue([
        privateControlledNeuron,
      ]);
    });
    it("should render makeNeuronsPublicBanner when ENABLE_NEURON_VISIBILITY set to true", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_VISIBILITY", true);
      const po = await renderComponent();

      expect(await po.getMakeNeuronsPublicBannerPo().isPresent()).toBe(true);
    });

    it("should render makeNeuronsPublicBanner when ENABLE_NEURON_VISIBILITY set to false", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_VISIBILITY", false);
      const po = await renderComponent();

      expect(await po.getMakeNeuronsPublicBannerPo().isPresent()).toBe(false);
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
