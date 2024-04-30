import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  actionableProposalCountStore,
  actionableProposalIndicationEnabledStore,
  actionableProposalSupportedStore,
  actionableProposalTotalCountStore,
} from "$lib/derived/actionable-proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { ProposalInfo } from "@dfinity/nns";
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
      const principal0 = principal(0);
      const principal1 = principal(1);
      const principal2 = principal(2);

      beforeEach(() => {
        actionableNnsProposalsStore.reset();
        actionableSnsProposalsStore.resetForTesting();
      });

      it("returns total actionable proposal count", async () => {
        expect(get(actionableProposalTotalCountStore)).toEqual(0);

        actionableNnsProposalsStore.setProposals(nnsProposals);
        actionableSnsProposalsStore.set({
          rootCanisterId: principal0,
          proposals: snsProposals,
          includeBallotsByCaller: true,
        });
        actionableSnsProposalsStore.set({
          rootCanisterId: principal1,
          proposals: snsProposals,
          includeBallotsByCaller: true,
        });
        actionableSnsProposalsStore.set({
          rootCanisterId: principal2,
          proposals: [],
          includeBallotsByCaller: false,
        });

        expect(get(actionableProposalTotalCountStore)).toEqual(
          nnsProposals.length + snsProposals.length * 2
        );
      });
    });
  });
});
