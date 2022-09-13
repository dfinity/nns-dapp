/**
 * @jest-environment jsdom
 */

import {
  GovernanceError,
  Topic,
  Vote,
  type NeuronId,
  type ProposalInfo,
} from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import * as proposalsApi from "../../../lib/api/proposals.api";
import * as neuronsServices from "../../../lib/services/neurons.services";
import { registerVotes } from "../../../lib/services/vote-registration.services";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import * as toastsStore from "../../../lib/stores/toasts.store";
import { voteRegistrationStore } from "../../../lib/stores/vote-registration.store";
import { replacePlaceholders } from "../../../lib/utils/i18n.utils";
import { waitForMilliseconds } from "../../../lib/utils/utils";
import { resetIdentity, setNoIdentity } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import { mockNeuron } from "../../mocks/neurons.mock";
import { mockProposalInfo } from "../../mocks/proposal.mock";

// mock loadProposal
let proposalInfoIdIndex = 0;
const proposalInfo = (): ProposalInfo => ({
  ...mockProposalInfo,
  id: BigInt(++proposalInfoIdIndex),
});
jest.mock("../../../lib/services/proposals.services", () => {
  return {
    loadProposal: ({ setProposal }) => {
      setProposal(proposalInfo);
      return Promise.resolve();
    },
  };
});

describe("vote-registration-services", () => {
  const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
  const neurons = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    neuronId,
  }));
  const spyOnToastsUpdate = jest.spyOn(toastsStore, "toastsUpdate");
  const spyOnToastsShow = jest.spyOn(toastsStore, "toastsShow");
  const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

  const mockRegisterVote = () => {
    return Promise.resolve();
  };
  const spyRegisterVote = jest
    .spyOn(proposalsApi, "registerVote")
    .mockImplementation(mockRegisterVote);

  beforeAll(() => {
    neuronsStore.setNeurons({
      neurons,
      certified: true,
    });
  });

  afterAll(() => {
    neuronsStore.reset();
  });

  beforeEach(() => {
    spyOnToastsUpdate.mockClear();
    spyOnToastsError.mockClear();
    spyOnToastsShow.mockClear();
  });

  describe("success voting", () => {
    beforeAll(() => {
      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());
    });

    afterAll(() => jest.clearAllMocks());

    it("should call the api to register multiple votes", async () => {
      await registerVotes({
        neuronIds,
        proposalInfo: proposalInfo(),
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledTimes(neuronIds.length)
      );
    });

    it("should not display errors on successful vote registration", async () => {
      const spyToastError = jest.spyOn(toastsStore, "toastsError");
      await registerVotes({
        neuronIds,
        proposalInfo: proposalInfo(),
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });
      expect(spyToastError).not.toBeCalled();
    });

    describe("voting in progress", () => {
      beforeAll(() => {
        jest
          .spyOn(neuronsServices, "listNeurons")
          .mockImplementation(() => Promise.resolve());
        jest
          .spyOn(proposalsApi, "queryProposal")
          .mockImplementation(() => Promise.resolve(proposalInfo()));

        jest
          .spyOn(proposalsApi, "registerVote")
          .mockImplementation(() => waitForMilliseconds(10));
      });

      afterAll(() => {
        jest.clearAllMocks();

        voteRegistrationStore.reset();
        neuronsStore.reset();
      });

      beforeEach(() => {
        spyOnToastsUpdate.mockClear();
        spyOnToastsError.mockClear();
        spyOnToastsShow.mockClear();
      });

      it("should update store with a new vote registration", (done) => {
        const proposal = proposalInfo();
        registerVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            //
            done();
          },
        });

        expect(get(voteRegistrationStore).registrations[0]).toBeDefined();

        expect(get(voteRegistrationStore).registrations[0].neuronIds).toEqual(
          neuronIds
        );
        expect(
          get(voteRegistrationStore).registrations[0].proposalInfo.id
        ).toEqual(proposal.id);
        expect(get(voteRegistrationStore).registrations[0].vote).toEqual(
          Vote.Yes
        );
      });

      it("should clear the store after registration", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo: proposalInfo(),
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            //
          },
        });

        await waitFor(() =>
          expect(get(voteRegistrationStore).registrations[0]).not.toBeDefined()
        );
      });

      it("should update successfullyVotedNeuronIds in the store", async () => {
        voteRegistrationStore.reset();

        const proposal = proposalInfo();
        const spyOnAddSuccessfullyVotedNeuronId = jest.spyOn(
          voteRegistrationStore,
          "addSuccessfullyVotedNeuronId"
        );

        registerVotes({
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
            proposalId: proposal.id,
            neuronId,
          });
        }
      });

      it("should show the vote adopt_in_progress toast", async () => {
        registerVotes({
          neuronIds,
          proposalInfo: proposalInfo(),
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
        registerVotes({
          neuronIds,
          proposalInfo: proposalInfo(),
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
        const proposal = proposalInfo();

        expect(spyOnToastsUpdate).toBeCalledTimes(0);

        await registerVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        for (let i = 1; i <= neuronIds.length; i++) {
          expect(spyOnToastsUpdate).toHaveBeenNthCalledWith(
            i,
            expect.objectContaining({
              content: expect.objectContaining({
                substitutions: {
                  $proposalId: expect.any(String),
                  $status: replacePlaceholders(
                    en.proposal_detail__vote.vote_status_registering,
                    {
                      $completed: `${i}`,
                      $amount: `${neuronIds.length}`,
                    }
                  ),
                  $topic: en.topics[Topic[proposal.topic]],
                },
              }),
            })
          );
        }
      });

      it("should display updating... message", async () => {
        const proposal = proposalInfo();

        expect(spyOnToastsUpdate).toBeCalledTimes(0);

        await registerVotes({
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
                  $status: replacePlaceholders(
                    en.proposal_detail__vote.vote_status_registering,
                    {
                      $completed: `${i}`,
                      $amount: `${neuronIds.length}`,
                    }
                  ),
                }),
              }),
            })
          );
        }
      });

      it("should hide the vote in progress toast after voting", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo: proposalInfo(),
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

    beforeAll(() => {
      jest
        .spyOn(proposalsApi, "registerVote")
        .mockImplementation(mockRegisterVoteGovernanceAlreadyVotedError);

      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());
    });

    afterAll(() => jest.clearAllMocks());

    it("should ignore already voted error", async () => {
      await registerVotes({
        neuronIds,
        proposalInfo: proposalInfo(),
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsError).not.toBeCalled();
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

    beforeAll(() => {
      jest.spyOn(console, "error").mockImplementation(jest.fn);
    });

    afterAll(() => {
      jest.clearAllMocks();

      jest.spyOn(proposalsApi, "registerVote").mockClear();
    });

    it("should show error.register_vote_unknown on not nns-js-based error", async () => {
      await registerVotes({
        neuronIds: null as unknown as NeuronId[],
        proposalInfo: null as unknown as ProposalInfo,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsError).toBeCalled();

      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({ labelKey: "error.register_vote_unknown" })
      );
    });

    it("should show error.register_vote on nns-js-based errors", async () => {
      jest
        .spyOn(proposalsApi, "registerVote")
        .mockImplementation(mockRegisterVoteError);

      await registerVotes({
        neuronIds,
        proposalInfo: proposalInfo(),
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
      const proposal = proposalInfo();
      jest
        .spyOn(proposalsApi, "registerVote")
        .mockImplementation(mockRegisterVoteError);

      await registerVotes({
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
      jest
        .spyOn(proposalsApi, "registerVote")
        .mockImplementation(mockRegisterVoteError);

      await registerVotes({
        neuronIds,
        proposalInfo: proposalInfo(),
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
      jest
        .spyOn(proposalsApi, "registerVote")
        .mockImplementation(mockRegisterVoteGovernanceError);

      await registerVotes({
        neuronIds,
        proposalInfo: proposalInfo(),
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
    beforeAll(() => {
      jest.spyOn(console, "error").mockImplementation(jest.fn);
      setNoIdentity();
    });

    afterAll(() => {
      jest.clearAllMocks();

      resetIdentity();
    });

    it("should display error if no identity", async () => {
      await registerVotes({
        neuronIds: [BigInt(0)],
        proposalInfo: proposalInfo(),
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyOnToastsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: en.error.missing_identity,
          level: "error",
        })
      );
    });
  });
});
