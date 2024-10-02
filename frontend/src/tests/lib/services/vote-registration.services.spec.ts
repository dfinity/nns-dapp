import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import * as authServices from "$lib/services/auth.services";
import * as neuronsServices from "$lib/services/neurons.services";
import { registerNnsVotes } from "$lib/services/nns-vote-registration.services";
import { processRegisterVoteErrors } from "$lib/services/vote-registration.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  mockGetIdentity,
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import {
  GovernanceError,
  ProposalRewardStatus,
  Vote,
  type ProposalInfo,
} from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

// mock loadProposal
let proposalInfoIdIndex = 0;
const proposalInfo = (): ProposalInfo => ({
  ...mockProposalInfo,
  id: BigInt(++proposalInfoIdIndex),
});
vi.mock("$lib/services/public/proposals.services", () => {
  return {
    loadProposal: ({ setProposal }) => {
      setProposal(proposalInfo);
      return Promise.resolve();
    },
  };
});

describe("vote-registration-services", () => {
  const neuronIds = [0n, 1n, 2n];
  const neurons = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    neuronId,
  }));
  const spyOnToastsUpdate = vi.spyOn(toastsStore, "toastsUpdate");
  const spyOnToastsShow = vi.spyOn(toastsStore, "toastsShow");
  const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");
  const spyRegisterVote = vi.spyOn(governanceApi, "registerVote");

  const votableProposal: ProposalInfo = {
    ...mockProposalInfo,
    id: 0n,
    ballots: [
      { neuronId: 0n, vote: Vote.Unspecified, votingPower: 1n },
      { neuronId: 1n, vote: Vote.Unspecified, votingPower: 1n },
      { neuronId: 2n, vote: Vote.Unspecified, votingPower: 1n },
    ],
  };
  let resolveSpyQueryProposals;
  const spyQueryProposals = vi
    .spyOn(api, "queryProposals")
    .mockReturnValue(
      new Promise((resolve) => (resolveSpyQueryProposals = resolve))
    );
  const spyQueryNeurons = vi
    .spyOn(governanceApi, "queryNeurons")
    .mockResolvedValue([...neurons]);

  let proposal: ProposalInfo = proposalInfo();

  beforeEach(() => {
    // Cleanup:
    vi.clearAllMocks();
    voteRegistrationStore.reset();
    proposalsStore.resetForTesting();
    resetIdentity();

    // Setup:
    proposal = proposalInfo();
    proposalsStore.setProposalsForTesting({
      proposals: [proposal],
      certified: true,
    });
    neuronsStore.setNeurons({
      neurons,
      certified: true,
    });
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
    vi.spyOn(neuronsServices, "listNeurons").mockImplementation(() =>
      Promise.resolve()
    );
    spyRegisterVote.mockResolvedValue(undefined);
  });

  describe("success voting", () => {
    it("should call the api to register multiple votes", async () => {
      expect(spyRegisterVote).not.toBeCalled();

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyRegisterVote).toBeCalledTimes(neuronIds.length);
    });

    it("should not display errors on successful vote registration", async () => {
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });
      expect(spyToastError).not.toBeCalled();
    });

    describe("voting in progress", () => {
      it("should clear the store after registration", async () => {
        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        await waitFor(() =>
          expect(
            get(voteRegistrationStore).registrations[
              OWN_CANISTER_ID.toText()
            ][0]
          ).not.toBeDefined()
        );
      });

      it("should update successfullyVotedNeuronIdStrings in the store", async () => {
        const spyOnAddSuccessfullyVotedNeuronId = vi.spyOn(
          voteRegistrationStore,
          "addSuccessfullyVotedNeuronId"
        );

        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        await waitFor(() =>
          expect(spyOnAddSuccessfullyVotedNeuronId).toBeCalledTimes(3)
        );

        for (const neuronId of neuronIds) {
          expect(spyOnAddSuccessfullyVotedNeuronId).toHaveBeenCalledWith({
            proposalIdString: `${proposal.id}`,
            neuronIdString: `${neuronId}`,
            canisterId: OWN_CANISTER_ID,
          });
        }
      });

      it("should show the vote adopt_in_progress toast", async () => {
        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        await waitFor(() =>
          expect(spyOnToastsShow).toBeCalledWith(
            expect.objectContaining({
              labelKey: "proposal_detail__vote.vote_adopt_in_progress",
            })
          )
        );
      });

      it("should show the vote reject_in_progress toast", async () => {
        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        await waitFor(() =>
          expect(spyOnToastsShow).toBeCalledWith(
            expect.objectContaining({
              labelKey: "proposal_detail__vote.vote_reject_in_progress",
            })
          )
        );
      });

      it("should display voted neurons count", async () => {
        expect(spyOnToastsUpdate).toBeCalledTimes(0);

        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        // NO initial message, 1 per neuron complete + update message
        await waitFor(() =>
          expect(spyOnToastsUpdate).toHaveBeenCalledTimes(neuronIds.length + 1)
        );

        for (let i = 1; i <= neuronIds.length; i++) {
          expect(spyOnToastsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
              content: expect.objectContaining({
                substitutions: {
                  $proposalId: `${proposal.id}`,
                  $status: replacePlaceholders(
                    en.proposal_detail__vote.vote_status_registering,
                    {
                      $completed: `${i}`,
                      $amount: `${neuronIds.length}`,
                    }
                  ),
                  $proposalType: "Motion",
                },
              }),
            })
          );
        }
      });

      it("should display updating... message", async () => {
        expect(spyOnToastsUpdate).toBeCalledTimes(0);

        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        for (let i = 1; i <= neuronIds.length; i++) {
          expect(spyOnToastsUpdate).toBeCalledWith(
            expect.objectContaining({
              content: expect.objectContaining({
                substitutions: expect.objectContaining({
                  $status: en.proposal_detail__vote.vote_status_updating,
                }),
              }),
            })
          );
        }
      });

      it("should reload actionable proposals after voting", async () => {
        actionableNnsProposalsStore.setProposals([proposal]);

        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: [proposal],
        });
        expect(spyQueryNeurons).toBeCalledTimes(0);
        expect(spyQueryProposals).toBeCalledTimes(0);

        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        // should use stored neurons
        expect(spyQueryNeurons).toBeCalledTimes(0);
        // reload actionable proposals
        expect(spyQueryProposals).toBeCalledTimes(1);
        expect(spyQueryProposals).toBeCalledWith({
          beforeProposal: undefined,
          certified: false,
          includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
          identity: mockIdentity,
        });

        // The store value should be not changed until the proposals are loaded
        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: [proposal],
        });

        // wait for actionable proposal loading
        resolveSpyQueryProposals([votableProposal]);
        await runResolvedPromises();

        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: [votableProposal, votableProposal],
        });
      });

      it("should hide the vote in progress toast after voting", async () => {
        await registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        // await waitFor(() => expect(firstSpinnerMessage()).not.toBeDefined());
      });
    });
  });

  describe("ignore errors", () => {
    const mockRegisterVoteGovernanceAlreadyVotedError =
      async (): Promise<void> => {
        throw new GovernanceError({
          error_message: "Neuron already voted on proposal.",
          error_type: 0,
        });
      };

    beforeEach(() => {
      spyRegisterVote.mockImplementation(() => {
        return mockRegisterVoteGovernanceAlreadyVotedError();
      });
    });

    it("should ignore already voted error", async () => {
      expect(spyRegisterVote).not.toBeCalled();

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsError).not.toBeCalled();
      expect(spyRegisterVote).toBeCalled();
    });
  });

  describe("register vote errors", () => {
    const mockRegisterVoteError = async (): Promise<void> => {
      throw new Error("test");
    };
    const mockRegisterVoteGovernanceError = async (): Promise<void> => {
      throw new GovernanceError({
        error_message: "governance-error",
        error_type: 0,
      });
    };

    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
    });

    it("should show error.register_vote_unknown on not nns-js-based error", async () => {
      expect(spyOnToastsError).toBeCalledTimes(0);

      await registerNnsVotes({
        neuronIds: [],
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          throw new Error("test");
        },
      });

      expect(spyOnToastsError).toBeCalledTimes(1);

      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({ labelKey: "error.register_vote_unknown" })
      );
    });

    it("should show error.register_vote on nns-js-based errors", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteError
      );

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          labelKey: "error.register_vote",
          level: "error",
        })
      );
    });

    it("should display proopsalId in error detail", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteError
      );

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          substitutions: expect.objectContaining({
            $proposalId: `${proposal.id}`,
          }),
          level: "error",
        })
      );
    });

    it("should show reason per neuron Error in detail", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteError
      );

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      // expect(error?.detail?.split(/test/).length).toBe(neuronIds.length + 1);
      expect(spyOnToastsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: neuronIds.map((_, i) => `${i}: test`).join(", "),
          level: "error",
        })
      );
    });

    it("should show reason per neuron GovernanceError in detail", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteGovernanceError
      );

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: neuronIds.map((_, i) => `${i}: governance-error`).join(", "),
          level: "error",
        })
      );
    });
  });

  describe("identity errors", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      setNoIdentity();
    });

    it("should display error if no identity", async () => {
      await registerNnsVotes({
        neuronIds: [0n],
        proposalInfo: proposal,
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsError).toHaveBeenCalledWith({
        err: new Error(en.error.missing_identity),
        labelKey: "error.register_vote_unknown",
      });
    });
  });

  describe("processRegisterVoteErrors", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
    });

    it("should display an error", async () => {
      const registerVoteResponses: PromiseSettledResult<void>[] = [
        {
          status: "rejected",
          reason: new Error("test"),
        },
      ];
      const neuronIdStrings = ["01"];
      const proposalIdString = "56";
      const proposalType = "Motion";

      processRegisterVoteErrors({
        registerVoteResponses,
        neuronIdStrings,
        proposalIdString,
        proposalType,
      });

      expect(spyOnToastsShow).toBeCalledTimes(1);

      expect(spyOnToastsShow).toBeCalledWith({
        level: "error",
        labelKey: "error.register_vote",
        detail: "01: test",
        substitutions: {
          $proposalId: "56",
          $proposalType: "Motion",
        },
      });
    });

    it("should display multiple errors", async () => {
      const registerVoteResponses: PromiseSettledResult<void>[] = [
        {
          status: "fulfilled",
          value: undefined,
        },
        {
          status: "rejected",
          reason: new Error("test"),
        },
        {
          status: "fulfilled",
          value: undefined,
        },
        {
          status: "rejected",
          reason: new Error("critical test"),
        },
      ];
      const neuronIdStrings = ["01", "02", "03", "04"];
      const proposalIdString = "56";
      const proposalType = "Motion";

      processRegisterVoteErrors({
        registerVoteResponses,
        neuronIdStrings,
        proposalIdString,
        proposalType,
      });

      expect(spyOnToastsShow).toBeCalledTimes(1);

      expect(spyOnToastsShow).toBeCalledWith({
        level: "error",
        labelKey: "error.register_vote",
        detail: "02: test, 04: critical test",
        substitutions: {
          $proposalId: "56",
          $proposalType: "Motion",
        },
      });
    });
  });
});
