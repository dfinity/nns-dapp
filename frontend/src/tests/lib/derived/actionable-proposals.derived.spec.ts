import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  actionableProposalCountStore,
  actionableProposalIndicationVisibleStore,
  actionableProposalTotalCountStore,
  actionableProposalsActiveStore,
  actionableProposalsLoadedStore,
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
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("actionable proposals derived stores", () => {
  const principal0 = principal(0);
  const principal1 = principal(1);
  const principal2 = principal(2);

  beforeEach(() => {
    resetSnsProjects();
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
});
