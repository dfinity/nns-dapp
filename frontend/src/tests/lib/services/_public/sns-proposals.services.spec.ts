/**
 * @jest-environment jsdom
 */

import * as api from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import {
  loadSnsProposals,
  registerVote,
} from "$lib/services/$public/sns-proposals.services";
import { authStore } from "$lib/stores/auth.store";
import { snsFiltesStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
import {
  mockAuthStoreNoIdentitySubscribe,
  mockAuthStoreSubscribe,
  mockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import {
  SnsProposalDecisionStatus,
  SnsVote,
  type SnsProposalData,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sns-proposals services", () => {
  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(1) }],
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(2) }],
  };
  const proposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(3) }],
  };
  const proposals = [proposal1, proposal2, proposal3];
  describe("loadSnsProposals", () => {
    const queryProposalsSpy = jest
      .spyOn(api, "queryProposals")
      .mockResolvedValue(proposals);

    describe("not logged in", () => {
      beforeEach(() => {
        snsFiltesStore.reset();
        snsProposalsStore.reset();
        jest.clearAllMocks();
        jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreNoIdentitySubscribe);
      });
      it("should call queryProposals with the default params", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
            beforeProposal: undefined,
            includeStatus: [],
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with the last proposal id params", async () => {
        const proposalId = { id: BigInt(1) };
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          beforeProposalId: proposalId,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
            beforeProposal: proposalId,
            includeStatus: [],
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with selected decision status filters", async () => {
        const proposalId = { id: BigInt(1) };
        const rootCanisterId = mockPrincipal;
        const decisionStatus = [
          {
            id: "1",
            value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
            name: "Adopted",
            checked: true,
          },
          {
            id: "2",
            value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
            name: "Open",
            checked: false,
          },
        ];
        const selectedDecisionStatus = decisionStatus
          .filter(({ checked }) => checked)
          .map(({ value }) => value);
        snsFiltesStore.setDecisionStatus({
          rootCanisterId,
          decisionStatus,
        });
        await loadSnsProposals({
          rootCanisterId,
          beforeProposalId: proposalId,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
            beforeProposal: proposalId,
            includeStatus: selectedDecisionStatus,
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should load the proposals in the store", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        await waitFor(() => {
          const storeData = get(snsProposalsStore);
          return expect(storeData[mockPrincipal.toText()]?.proposals).toEqual(
            proposals
          );
        });
      });

      it("set completed to true if response has less than page size", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        await waitFor(() => {
          const storeData = get(snsProposalsStore);
          return expect(storeData[mockPrincipal.toText()]?.completed).toEqual(
            true
          );
        });
      });
    });

    describe("logged in", () => {
      beforeEach(() => {
        snsProposalsStore.reset();
        jest.clearAllMocks();
        jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreSubscribe);
      });

      it("should call queryProposals with user's identity", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
            beforeProposal: undefined,
            includeStatus: [],
          },
          identity: mockIdentity,
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });
    });
  });

  describe("registerVote", () => {
    const neuronId = { id: arrayOfNumberToUint8Array([1, 2, 3]) };
    const proposalId = mockSnsProposal.id[0];
    const vote = SnsVote.Yes;

    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    it("should call registerVote api", async () => {
      const registerVoteApiSpy = jest
        .spyOn(api, "registerVote")
        .mockResolvedValue(undefined);
      const result = await registerVote({
        rootCanisterId: mockPrincipal,
        neuronId,
        proposalId,
        vote,
      });

      expect(registerVoteApiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          rootCanisterId: mockPrincipal,
          neuronId,
          proposalId,
          vote,
        })
      );

      expect(result).toEqual({ success: true });
    });

    it("should handle errors", async () => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest.spyOn(api, "registerVote").mockRejectedValue(new Error());
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      const result = await registerVote({
        rootCanisterId: mockPrincipal,
        neuronId,
        proposalId,
        vote,
      });

      expect(result).toEqual({ success: false });

      expect(spyToastError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_register_vote",
        })
      );
    });
  });
});
