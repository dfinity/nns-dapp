import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  actionableProposalCountStore,
  actionableProposalIndicationVisibleStore,
  actionableProposalTotalCountStore,
  actionableProposalsActiveStore,
  actionableProposalsLoadedStore,
  actionableProposalsNavigationIdsStore,
  actionableSnsProposalsByUniverseStore,
} from "$lib/derived/actionable-proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("actionable proposals derived stores", () => {
  const createProposal = (proposalId: bigint): SnsProposalData =>
    createSnsProposal({
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      proposalId,
    });
  const principal0 = principal(0);
  const principal1 = principal(1);
  const principal2 = principal(2);

  beforeEach(() => {
    resetSnsProjects();
    failedActionableSnsesStore.resetForTesting();
  });

  describe("actionableProposalIndicationVisibleStore", () => {
    it("returns true when the user is signed-in and on proposals page", async () => {
      resetIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });
      expect(get(actionableProposalIndicationVisibleStore)).toBe(true);
    });

    it("returns false when the user is not signed-in", async () => {
      setNoIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });
      expect(get(actionableProposalIndicationVisibleStore)).toBe(false);
    });

    it("returns false when the user is not on proposals page", async () => {
      const testPath = (routeId: AppPath) => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId,
        });
        expect(get(actionableProposalIndicationVisibleStore)).toBe(false);
      };
      resetIdentity();

      testPath(AppPath.Accounts);
      testPath(AppPath.Neurons);
      testPath(AppPath.Launchpad);
    });
  });

  describe("actionableProposalsActiveStore", () => {
    it('returns true when the user is signed-in and the segment is on "Actionable"', async () => {
      resetIdentity();
      actionableProposalsSegmentStore.set("actionable");
      expect(get(actionableProposalsActiveStore)).toBe(true);
    });

    it("returns false when the user is not signed-in", async () => {
      setNoIdentity();
      actionableProposalsSegmentStore.set("actionable");
      expect(get(actionableProposalsActiveStore)).toBe(false);
    });

    it('returns false when the segment is on "All"', async () => {
      resetIdentity();
      actionableProposalsSegmentStore.set("all");
      expect(get(actionableProposalsActiveStore)).toBe(false);
    });
  });

  describe("actionableProposalCountStore", () => {
    const nnsProposals: ProposalInfo[] = [
      {
        ...mockProposalInfo,
        id: 0n,
      },
      {
        ...mockProposalInfo,
        id: 1n,
      },
    ];
    const snsProposals = [mockSnsProposal];

    it("returns actionable proposal count", async () => {
      expect(get(actionableProposalCountStore)).toEqual({
        [OWN_CANISTER_ID_TEXT]: undefined,
      });

      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: snsProposals,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal2,
        proposals: [],
      });

      expect(get(actionableProposalCountStore)).toEqual({
        [OWN_CANISTER_ID_TEXT]: nnsProposals.length,
        [principal0.toText()]: snsProposals.length,
        [principal1.toText()]: 0,
        [principal2.toText()]: 0,
      });
    });
  });

  describe("actionableProposalTotalCountStore", () => {
    const nnsProposals: ProposalInfo[] = [
      {
        ...mockProposalInfo,
        id: 0n,
      },
      {
        ...mockProposalInfo,
        id: 1n,
      },
    ];
    const snsProposals = [mockSnsProposal];

    it("returns total actionable proposal count", async () => {
      expect(get(actionableProposalTotalCountStore)).toEqual(0);

      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: snsProposals,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: snsProposals,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal2,
        proposals: snsProposals,
      });

      expect(get(actionableProposalTotalCountStore)).toEqual(
        nnsProposals.length + snsProposals.length * 3
      );
    });
  });

  describe("actionableSnsProposalsByUniverseStore", () => {
    const proposals0 = [createProposal(0n)];
    const proposals1 = [createProposal(1n)];

    it("should return snses with proposals", async () => {
      expect(get(actionableSnsProposalsByUniverseStore)).toEqual([]);

      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal0,
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal1,
        },
      ]);

      expect(get(actionableSnsProposalsByUniverseStore)).toEqual([]);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: proposals0,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: proposals1,
      });

      expect(
        get(actionableSnsProposalsByUniverseStore).map(
          ({ universe: { canisterId }, proposals }) => [canisterId, proposals]
        )
      ).toEqual([
        [principal0.toText(), proposals0],
        [principal1.toText(), proposals1],
      ]);
    });
  });

  describe("actionableProposalsLoadedStore", () => {
    it("should return true when all actionable proposals are loaded", async () => {
      expect(get(actionableProposalsLoadedStore)).toEqual(false);
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal0,
        },
      ]);

      expect(get(actionableProposalsLoadedStore)).toEqual(false);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [],
      });

      expect(get(actionableProposalsLoadedStore)).toEqual(false);
      actionableNnsProposalsStore.setProposals([mockProposalInfo]);

      expect(get(actionableProposalsLoadedStore)).toEqual(true);
    });

    it("should return false when actionable proposals are loaded not of all Snses", async () => {
      expect(get(actionableProposalsLoadedStore)).toEqual(false);
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal0,
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal1,
        },
      ]);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [],
      });
      actionableNnsProposalsStore.setProposals([mockProposalInfo]);

      expect(get(actionableProposalsLoadedStore)).toEqual(false);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [],
      });

      expect(get(actionableProposalsLoadedStore)).toEqual(true);
    });

    it("should consider failed snses as loaded", async () => {
      expect(get(actionableProposalsLoadedStore)).toEqual(false);
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal0,
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal1,
        },
      ]);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [],
      });
      actionableNnsProposalsStore.setProposals([mockProposalInfo]);

      expect(get(actionableProposalsLoadedStore)).toEqual(false);

      failedActionableSnsesStore.add(principal1.toText());

      expect(get(actionableProposalsLoadedStore)).toEqual(true);
    });
  });

  describe("actionableProposalsNavigationIdsStore", () => {
    it("should return navigation IDs", async () => {
      expect(get(actionableProposalsNavigationIdsStore)).toEqual([]);

      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: Principal.fromText("g3pce-2iaae"),
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: Principal.fromText("f7crg-kabae"),
        },
      ]);
      // Add Sns proposals in reverse order to test that the universe order is used.
      actionableSnsProposalsStore.set({
        rootCanisterId: Principal.fromText("f7crg-kabae"),
        proposals: [createProposal(1n), createProposal(0n)],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: Principal.fromText("g3pce-2iaae"),
        proposals: [createProposal(3n), createProposal(2n)],
      });
      actionableNnsProposalsStore.setProposals([
        {
          ...mockProposalInfo,
          id: 2n,
        },
        {
          ...mockProposalInfo,
          id: 1n,
        },
      ]);
      await runResolvedPromises();

      expect(get(actionableProposalsNavigationIdsStore)).toEqual([
        {
          universe: OWN_CANISTER_ID_TEXT,
          proposalId: 2n,
        },
        {
          universe: OWN_CANISTER_ID_TEXT,
          proposalId: 1n,
        },
        {
          proposalId: 3n,
          universe: "g3pce-2iaae",
        },
        {
          proposalId: 2n,
          universe: "g3pce-2iaae",
        },
        {
          proposalId: 1n,
          universe: "f7crg-kabae",
        },
        {
          proposalId: 0n,
          universe: "f7crg-kabae",
        },
      ]);
    });
  });
});
