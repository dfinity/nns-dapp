import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  actionableProposalCountStore,
  actionableProposalIndicationEnabledStore,
  actionableProposalSupportedStore,
  createIsActionableProposalStore,
} from "$lib/derived/actionable-proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { mockSnsCanisterIdText } from "$tests/mocks/sns.api.mock";
import type { ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

describe("actionable proposals derived stores", () => {
  describe("actionableProposalIndicationEnabledStore", () => {
    it("returns true when the user is signed-in and on proposals page", async () => {
      resetIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });
      expect(get(actionableProposalIndicationEnabledStore)).toBe(true);
    });

    it("returns false when the user is not signed-in", async () => {
      setNoIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });
      expect(get(actionableProposalIndicationEnabledStore)).toBe(false);
    });

    it("returns false when the user is not on proposals page", async () => {
      const testPath = (routeId: AppPath) => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId,
        });
        expect(get(actionableProposalIndicationEnabledStore)).toBe(false);
      };
      resetIdentity();

      testPath(AppPath.Accounts);
      testPath(AppPath.Neurons);
      testPath(AppPath.Launchpad);
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
    const principal0 = principal(0);
    const principal1 = principal(1);
    const principal2 = principal(2);

    beforeEach(() => {
      actionableNnsProposalsStore.reset();
      actionableSnsProposalsStore.resetForTesting();
    });

    it("returns actionable proposal count", async () => {
      expect(get(actionableProposalCountStore)).toEqual({
        [OWN_CANISTER_ID_TEXT]: undefined,
      });

      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: snsProposals,
        includeBallotsByCaller: true,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [],
        includeBallotsByCaller: true,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal2,
        proposals: [],
        includeBallotsByCaller: false,
      });

      expect(get(actionableProposalCountStore)).toEqual({
        [OWN_CANISTER_ID_TEXT]: nnsProposals.length,
        [principal0.toText()]: snsProposals.length,
        [principal1.toText()]: 0,
      });
    });
  });

  describe("actionableProposalSupportedStore", () => {
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
    const principal0 = principal(0);
    const principal1 = principal(1);

    beforeEach(() => {
      actionableNnsProposalsStore.reset();
      actionableSnsProposalsStore.resetForTesting();
    });

    it("returns true for nns", async () => {
      expect(get(actionableProposalSupportedStore)).toEqual({
        [OWN_CANISTER_ID_TEXT]: true,
      });
    });

    it("returns actionable proposal support", async () => {
      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: snsProposals,
        includeBallotsByCaller: true,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [],
        includeBallotsByCaller: false,
      });

      expect(get(actionableProposalSupportedStore)).toEqual({
        [OWN_CANISTER_ID_TEXT]: true,
        [principal0.toText()]: true,
        [principal1.toText()]: false,
      });
    });
  });

  describe("createIsActionableProposalStore", () => {
    const nnsProposal0: ProposalInfo = {
      ...mockProposalInfo,
      id: 0n,
    };
    const nnsProposal1: ProposalInfo = {
      ...mockProposalInfo,
      id: 1n,
    };
    const snsProposal0 = createSnsProposal({
      proposalId: 0n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const snsProposal1 = createSnsProposal({
      proposalId: 1n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });

    beforeEach(() => {
      page.reset();
      actionableNnsProposalsStore.reset();
      actionableSnsProposalsStore.resetForTesting();
    });

    it("returns actionable state for nns proposal", async () => {
      const isActionableProposalStore = createIsActionableProposalStore(1n);
      // no nns proposals
      expect(get(isActionableProposalStore)).toBe(undefined);

      actionableNnsProposalsStore.setProposals([nnsProposal0]);
      expect(get(isActionableProposalStore)).toBe(false);

      actionableNnsProposalsStore.setProposals([nnsProposal0, nnsProposal1]);
      expect(get(isActionableProposalStore)).toBe(true);

      // selected project contains no data
      page.mock({ data: { universe: mockSnsCanisterIdText } });
      expect(get(isActionableProposalStore)).toBe(undefined);
    });

    it("returns actionable state for sns proposal", async () => {
      const isActionableProposalStore = createIsActionableProposalStore(1n);
      expect(get(isActionableProposalStore)).toBe(undefined);

      actionableSnsProposalsStore.set({
        rootCanisterId: Principal.fromText(mockSnsCanisterIdText),
        proposals: [snsProposal0, snsProposal1],
        includeBallotsByCaller: true,
      });
      // selected project contains no data
      expect(get(isActionableProposalStore)).toBe(undefined);

      page.mock({ data: { universe: mockSnsCanisterIdText } });
      expect(get(isActionableProposalStore)).toBe(true);

      actionableSnsProposalsStore.set({
        rootCanisterId: Principal.fromText(mockSnsCanisterIdText),
        proposals: [snsProposal0],
        includeBallotsByCaller: true,
      });
      expect(get(isActionableProposalStore)).toBe(false);
    });

    it("returns undefined when proposal id equals undefined", async () => {
      const isActionableProposalStore =
        createIsActionableProposalStore(undefined);
      expect(get(isActionableProposalStore)).toBe(undefined);
    });
  });
});
