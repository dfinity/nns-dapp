import * as api from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import {
  getSnsProposalById,
  loadSnsProposals,
  registerVote,
} from "$lib/services/$public/sns-proposals.services";
import { authStore } from "$lib/stores/auth.store";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  mockAuthStoreNoIdentitySubscribe,
  mockAuthStoreSubscribe,
  mockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import {
  SnsProposalDecisionStatus,
  SnsVote,
  type SnsProposalData,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { vi } from "vitest";

describe("sns-proposals services", () => {
  beforeEach(() => {
    snsFiltersStore.reset();
    snsProposalsStore.reset();
    toastsStore.reset();
    vi.clearAllMocks();
  });
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
    const queryProposalsSpy = vi
      .spyOn(api, "queryProposals")
      .mockResolvedValue(proposals);

    describe("not logged in", () => {
      beforeEach(() => {
        snsFiltersStore.reset();
        snsProposalsStore.reset();
        vi.clearAllMocks();
        vi.spyOn(authStore, "subscribe").mockImplementation(
          mockAuthStoreNoIdentitySubscribe
        );
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
        snsFiltersStore.setDecisionStatus({
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
        vi.clearAllMocks();
        vi.spyOn(authStore, "subscribe").mockImplementation(
          mockAuthStoreSubscribe
        );
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
      vi.clearAllMocks();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });

    it("should call registerVote api", async () => {
      const registerVoteApiSpy = vi
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
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.spyOn(api, "registerVote").mockRejectedValue(new Error());
      const spyToastError = vi.spyOn(toastsFunctions, "toastsError");

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

  describe("getSnsProposalById", () => {
    const rootCanisterId = mockPrincipal;
    const proposalId = mockSnsProposal.id[0];

    describe("not logged in", () => {
      beforeEach(() => {
        vi.spyOn(authStore, "subscribe").mockImplementation(
          mockAuthStoreNoIdentitySubscribe
        );
      });

      it("should use the proposal in store if certified and not call api", () =>
        new Promise<void>((done) => {
          const queryProposalSpy = vi
            .spyOn(api, "queryProposal")
            .mockResolvedValue(mockSnsProposal);
          snsProposalsStore.setProposals({
            rootCanisterId,
            proposals: [mockSnsProposal],
            certified: true,
            completed: true,
          });
          getSnsProposalById({
            rootCanisterId,
            proposalId,
            setProposal: ({ proposal }) => {
              expect(queryProposalSpy).not.toBeCalledTimes(1);
              expect(proposal).toEqual(mockSnsProposal);
              done();
            },
            reloadForBallots: false,
          });
        }));

      it("should not use the proposal in store if not certified and call api", () =>
        new Promise<void>((done) => {
          const queryProposalSpy = vi
            .spyOn(api, "queryProposal")
            .mockResolvedValue(mockSnsProposal);
          snsProposalsStore.setProposals({
            rootCanisterId,
            proposals: [mockSnsProposal],
            certified: false,
            completed: true,
          });
          getSnsProposalById({
            rootCanisterId,
            proposalId,
            setProposal: () => {
              expect(queryProposalSpy).toBeCalledWith({
                identity: new AnonymousIdentity(),
                certified: false,
                rootCanisterId,
                proposalId,
              });
              expect(queryProposalSpy).toBeCalledTimes(1);
              done();
            },
            reloadForBallots: false,
          });
        }));

      it("should call api if store is empty", () =>
        new Promise<void>((done) => {
          const queryProposalSpy = vi
            .spyOn(api, "queryProposal")
            .mockResolvedValue(mockSnsProposal);
          getSnsProposalById({
            rootCanisterId,
            proposalId,
            setProposal: () => {
              expect(queryProposalSpy).toBeCalledWith({
                identity: new AnonymousIdentity(),
                certified: false,
                rootCanisterId,
                proposalId,
              });
              expect(queryProposalSpy).toBeCalledTimes(1);
              done();
            },
            reloadForBallots: false,
          });
        }));
    });

    describe("logged in", () => {
      beforeEach(() => {
        vi.spyOn(authStore, "subscribe").mockImplementation(
          mockAuthStoreSubscribe
        );
      });

      it("should use the proposal in store if certified and not call api", () =>
        new Promise<void>((done) => {
          const queryProposalSpy = vi
            .spyOn(api, "queryProposal")
            .mockResolvedValue(mockSnsProposal);
          snsProposalsStore.setProposals({
            rootCanisterId,
            proposals: [mockSnsProposal],
            certified: true,
            completed: true,
          });
          getSnsProposalById({
            rootCanisterId,
            proposalId,
            setProposal: ({ proposal }) => {
              expect(queryProposalSpy).not.toBeCalledTimes(1);
              expect(proposal).toEqual(mockSnsProposal);
              done();
            },
            reloadForBallots: false,
          });
        }));

      it("should ignore the proposal in store if it contains no ballots and the reloadForBallots flag is set", async () => {
        const queryProposalSpy = vi
          .spyOn(api, "queryProposal")
          .mockResolvedValue(mockSnsProposal);
        snsProposalsStore.setProposals({
          rootCanisterId,
          proposals: [
            {
              ...mockSnsProposal,
              ballots: [],
            },
          ],
          certified: true,
          completed: true,
        });
        let dataCertified = false;
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          reloadForBallots: true,
          setProposal: ({ certified, proposal }) => {
            if (certified) {
              dataCertified = true;
              expect(proposal).toEqual(mockSnsProposal);
            }
          },
        });
        await waitFor(() => expect(dataCertified).toBe(true));
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: false,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledTimes(2);
      });

      it("should not use the proposal in store if not certified and call api", async () => {
        const queryProposalSpy = vi
          .spyOn(api, "queryProposal")
          .mockResolvedValue(mockSnsProposal);
        snsProposalsStore.setProposals({
          rootCanisterId,
          proposals: [mockSnsProposal],
          certified: false,
          completed: true,
        });
        let dataCertified = false;
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: ({ certified, proposal }) => {
            if (certified) {
              dataCertified = true;
              expect(proposal).toEqual(mockSnsProposal);
            }
          },
          reloadForBallots: false,
        });

        await waitFor(() => expect(dataCertified).toBe(true));
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: false,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledTimes(2);
      });

      it("should call api if store is empty", async () => {
        const queryProposalSpy = vi
          .spyOn(api, "queryProposal")
          .mockResolvedValue(mockSnsProposal);
        let dataCertified = false;
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: ({ certified }) => {
            if (certified) {
              dataCertified = true;
            }
          },
          reloadForBallots: false,
        });
        await waitFor(() => expect(dataCertified).toBe(true));
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: false,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledTimes(2);
      });

      it("should call handle error if api call fails", async () => {
        vi.spyOn(api, "queryProposal").mockRejectedValue(new Error("error"));
        const handleErrorSpy = vi.fn();
        const setProposalSpy = vi.fn();
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: setProposalSpy,
          handleError: handleErrorSpy,
          reloadForBallots: false,
        });

        await waitFor(() => expect(handleErrorSpy).toBeCalledTimes(2));
      });

      it("should show error if api call fails", async () => {
        vi.spyOn(api, "queryProposal").mockRejectedValue(new Error("error"));
        const handleErrorSpy = vi.fn();
        const setProposalSpy = vi.fn();
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: setProposalSpy,
          handleError: handleErrorSpy,
          reloadForBallots: false,
        });

        await waitFor(() => expect(handleErrorSpy).toBeCalledTimes(2));
        expect(get(toastsStore)[0]).toMatchObject({
          level: "error",
          text: replacePlaceholders(en.error.get_proposal, {
            $proposalId: proposalId.id.toString(),
          }),
        });
      });
    });
  });
});
