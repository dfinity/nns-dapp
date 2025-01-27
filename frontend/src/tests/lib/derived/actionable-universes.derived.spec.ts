import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  actionableProposalsNavigationIdsStore,
  actionableSnsProposalsByUniverseStore,
} from "$lib/derived/actionable-universes.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("actionable universes derived stores", () => {
  const createProposal = (proposalId: bigint): SnsProposalData =>
    createSnsProposal({
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      proposalId,
    });
  const principal0 = principal(0);
  const principal1 = principal(1);

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
