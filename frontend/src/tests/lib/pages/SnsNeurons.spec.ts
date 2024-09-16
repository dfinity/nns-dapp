import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { enumValues } from "$lib/utils/enum.utils";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { SnsNeuronsPo } from "$tests/page-objects/SnsNeurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import {
  SnsNeuronPermissionType,
  SnsSwapLifecycle,
  neuronSubaccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/api/sns-ledger.api");

describe("SnsNeurons", () => {
  const rootCanisterId = rootCanisterIdMock;
  const neuron1Stake = 200_000_000n;
  const neuron1 = createMockSnsNeuron({
    id: [1, 2, 3],
    stake: neuron1Stake,
  });
  const disbursedNeuronStake = 0n;
  const disbursedNeuron = createMockSnsNeuron({
    id: [1, 2, 5],
    stake: disbursedNeuronStake,
    maturity: 0n,
  });
  const neuronNFStake = 400_000_000n;
  const neuronNF: SnsNeuron = {
    ...createMockSnsNeuron({
      id: [1, 2, 6],
      stake: neuronNFStake,
    }),
    source_nns_neuron_id: [123n],
  };
  const projectName = "Tetris";

  beforeEach(() => {
    vi.clearAllMocks();
    checkedNeuronSubaccountsStore.reset();
    overrideFeatureFlagsStore.reset();
    page.mock({ data: { universe: rootCanisterId.toText() } });
    resetIdentity();
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
      mockSnsMainAccount.balanceUlps
    );

    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
      },
    ]);
    vi.spyOn(snsGovernanceApi, "getNeuronBalance").mockResolvedValue(0n);
  });

  const renderComponent = async () => {
    const { container } = render(SnsNeurons);
    await runResolvedPromises();
    return SnsNeuronsPo.under(new JestPageObjectElement(container));
  };

  describe("while loading", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockReturnValue(
        new Promise(() => {
          // Don't resolve the promise to keep the component in loading state.
        })
      );
    });

    it("should render a spinner", async () => {
      const po = await renderComponent();

      expect(await po.hasSpinner()).toBe(true);
      expect(await po.getSkeletonCardPo().isPresent()).toBe(false);
    });

    it("should not render empty text", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(false);
    });
  });

  describe("with normal neurons and neurons from CF", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuron1,
        neuronNF,
      ]);
    });

    it("should render the neurons table", async () => {
      const po = await renderComponent();

      expect(await po.getNeuronsTablePo().isPresent()).toBe(true);
    });

    it("should render neurons table rows", async () => {
      const po = await renderComponent();

      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(rows).toHaveLength(2);
    });

    it("should not render empty text", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(false);
    });

    it("should not render disbursed neurons", async () => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        neuron1,
        disbursedNeuron,
        neuronNF,
      ]);
      const po = await renderComponent();

      const rows = await po.getNeuronsTablePo().getNeuronsTableRowPos();
      expect(rows).toHaveLength(2);
    });

    it("should claim unclaimed neuron", async () => {
      setSnsProjects([
        {
          rootCanisterId,
          neuronMinimumStakeE8s: 50_000_000n,
        },
      ]);
      const unclaimedNeuronIndex1 = 0;
      const unclaimedNeuronIndex2 = 1;
      const unclaimedNeuronSubaccount1 = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: unclaimedNeuronIndex1,
      });
      const unclaimedNeuronSubaccount2 = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: unclaimedNeuronIndex2,
      });
      const unclaimedNeuronId1: SnsNeuronId = {
        id: unclaimedNeuronSubaccount1,
      };
      const unclaimedNeuronId2: SnsNeuronId = {
        id: unclaimedNeuronSubaccount2,
      };
      const unclaimedNeuron1 = createMockSnsNeuron({
        id: Array.from(unclaimedNeuronId1.id),
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(
              enumValues(SnsNeuronPermissionType)
            ),
          },
        ],
      });

      const spyGetNeuronBalance = vi
        .spyOn(snsGovernanceApi, "getNeuronBalance")
        .mockResolvedValueOnce(100_000_000n)
        .mockResolvedValueOnce(0n);
      const spyClaimNeuron = vi
        .spyOn(snsGovernanceApi, "claimNeuron")
        .mockResolvedValue(unclaimedNeuronId1);
      vi.spyOn(snsGovernanceApi, "getSnsNeuron").mockResolvedValue(
        unclaimedNeuron1
      );

      expect(spyGetNeuronBalance).toBeCalledTimes(0);

      await renderComponent();

      expect(spyGetNeuronBalance).toBeCalledTimes(2);
      expect(spyGetNeuronBalance).toBeCalledWith({
        rootCanisterId,
        neuronId: unclaimedNeuronId1,
        certified: false,
        identity: mockIdentity,
      });
      expect(spyGetNeuronBalance).toBeCalledWith({
        rootCanisterId,
        neuronId: unclaimedNeuronId2,
        certified: false,
        identity: mockIdentity,
      });
      expect(spyClaimNeuron).toBeCalledTimes(1);
      expect(spyClaimNeuron).toBeCalledWith({
        rootCanisterId,
        subaccount: unclaimedNeuronSubaccount1,
        memo: BigInt(unclaimedNeuronIndex1),
        controller: mockIdentity.getPrincipal(),
        identity: mockIdentity,
      });
    });
  });

  describe("no neurons", () => {
    beforeEach(() => {
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([]);
    });

    it("should not render the neurons table", async () => {
      const po = await renderComponent();

      expect(await po.getNeuronsTablePo().isPresent()).toBe(false);
    });

    it("should render empty text if no neurons", async () => {
      const po = await renderComponent();

      expect(await po.hasEmptyMessage()).toBe(true);
    });
  });
});
