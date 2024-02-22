import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  actionableProposalCountStore,
  actionableProposalIndicationEnabledStore,
} from "$lib/derived/actionable-proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { beforeEach } from "vitest";

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
      setNoIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Accounts,
      });
      expect(get(actionableProposalIndicationEnabledStore)).toBe(false);
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

    beforeEach(() => {
      actionableNnsProposalsStore.reset();
      actionableSnsProposalsStore.resetForTesting();
    });

    it("returns actionable proposal count", async () => {
      expect(get(actionableProposalCountStore)[OWN_CANISTER_ID_TEXT]).toEqual(
        undefined
      );
      expect(get(actionableProposalCountStore)[principal0.toText()]).toEqual(
        undefined
      );
      expect(get(actionableProposalCountStore)[principal1.toText()]).toEqual(
        undefined
      );

      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.setProposals({
        rootCanisterId: rootCanisterIdMock,
        proposals: snsProposals,
      });
      actionableSnsProposalsStore.setProposals({
        rootCanisterId: principal0,
        proposals: snsProposals,
      });
      actionableSnsProposalsStore.setProposals({
        rootCanisterId: principal1,
        proposals: [],
      });

      expect(get(actionableProposalCountStore)[OWN_CANISTER_ID_TEXT]).toEqual(
        nnsProposals.length
      );
      expect(get(actionableProposalCountStore)[principal0.toText()]).toEqual(
        snsProposals.length
      );
      expect(get(actionableProposalCountStore)[principal1.toText()]).toEqual(0);
    });
  });
});
