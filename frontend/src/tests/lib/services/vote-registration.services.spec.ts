import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import * as authServices from "$lib/services/auth.services";
import * as neuronsServices from "$lib/services/neurons.services";
import { registerNnsVotes } from "$lib/services/nns-vote-registration.services";
import * as proposalsServices from "$lib/services/public/proposals.services";
import { processRegisterVoteErrors } from "$lib/services/vote-registration.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import {
  mockGetIdentity,
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import {
  mockProposalInfo,
  proposalActionMotion,
} from "$tests/mocks/proposal.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import {
  GovernanceError,
  ProposalRewardStatus,
  Topic,
  Vote,
  type ProposalInfo,
} from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

const proposalTopic = Topic.Governance;
const proposalTypeName = en.actions.Motion;

let proposalInfoIdIndex = 0;
const proposalInfo = (): ProposalInfo => ({
  ...mockProposalInfo,
  id: BigInt(++proposalInfoIdIndex),
  topic: proposalTopic,
  proposal: {
    ...mockProposalInfo.proposal,
    action: proposalActionMotion,
  },
});

describe("vote-registration-services", () => {
  const neuronIds = [0n, 1n, 2n];
  const neurons = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    neuronId,
  }));
  let spyRegisterVote;
  let spyLoadProposal;

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
  let spyQueryProposals;
  let spyQueryNeurons;

  let proposal: ProposalInfo = proposalInfo();

  beforeEach(() => {
    // Cleanup:
    vi.restoreAllMocks();
    voteRegistrationStore.reset();
    toastsStore.reset();
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
    spyRegisterVote = vi
      .spyOn(governanceApi, "registerVote")
      .mockResolvedValue(undefined);
    spyLoadProposal = vi
      .spyOn(proposalsServices, "loadProposal")
      .mockImplementation(async ({ setProposal }) => {
        setProposal(proposal);
      });
    spyQueryProposals = vi
      .spyOn(api, "queryProposals")
      .mockReturnValue(
        new Promise((resolve) => (resolveSpyQueryProposals = resolve))
      );
    spyQueryNeurons = vi
      .spyOn(governanceApi, "queryNeurons")
      .mockResolvedValue([...neurons]);
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
      expect(get(toastsStore)).toEqual([]);
      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });
      expect(get(toastsStore)).toEqual([]);
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
        // Make registerVote never resolve because when registerNnsVotes
        // finishes the toast that was visible is hidden again.
        const never = new Promise<void>(() => {});
        spyRegisterVote.mockReturnValue(never);
        expect(get(toastsStore)).toEqual([]);

        registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.Yes,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        expect(get(toastsStore)).toMatchObject([
          {
            level: "info",
            text: `Adopting proposal ${proposalTypeName} (${proposal.id}). Neurons registered: 0/3. Keep the dapp open until completed.`,
          },
        ]);
      });

      it("should show the vote reject_in_progress toast", async () => {
        // Make registerVote never resolve because when registerNnsVotes
        // finishes the toast that was visible is hidden again.
        const never = new Promise<void>(() => {});
        spyRegisterVote.mockReturnValue(never);
        expect(get(toastsStore)).toEqual([]);

        registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });

        await runResolvedPromises();
        expect(get(toastsStore)).toMatchObject([
          {
            level: "info",
            text: `Rejecting proposal ${proposalTypeName} (${proposal.id}). Neurons registered: 0/3. Keep the dapp open until completed.`,
          },
        ]);
      });

      it("should display voted neurons count", async () => {
        const resolveRegisterVote = [];
        spyRegisterVote.mockImplementation(() => {
          return new Promise<void>((resolve) => {
            resolveRegisterVote.push(resolve);
          });
        });
        expect(get(toastsStore)).toEqual([]);

        registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });
        await runResolvedPromises();

        for (let i = 0; i < neuronIds.length; i++) {
          expect(get(toastsStore)).toMatchObject([
            {
              level: "info",
              text: `Rejecting proposal ${proposalTypeName} (${proposal.id}). Neurons registered: ${i}/3. Keep the dapp open until completed.`,
            },
          ]);

          resolveRegisterVote.shift()();
          await runResolvedPromises();
        }

        // There is also code that shows a toast  with
        // "Neurons registered: 3/3" but it is immediately replaced by another
        // toast so it never visible.
        expect(get(toastsStore)).toEqual([]);
      });

      it("should display updating... message", async () => {
        // Make loadProposal never resolve because when registerNnsVotes
        // finishes the toast that was visible is hidden again.
        const never = new Promise<void>(() => {});
        spyLoadProposal.mockReturnValue(never);
        expect(get(toastsStore)).toEqual([]);

        registerNnsVotes({
          neuronIds,
          proposalInfo: proposal,
          vote: Vote.No,
          reloadProposalCallback: () => {
            // do nothing
          },
        });
        await runResolvedPromises();

        for (let i = 1; i <= neuronIds.length; i++) {
          // NOTE: This expectation does not depend on i.
          // Probably something else was intended to be expected?
          expect(get(toastsStore)).toMatchObject([
            {
              level: "info",
              text: `Rejecting proposal ${proposalTypeName} (${proposal.id}). Updating proposal state...`,
            },
          ]);
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
      expect(get(toastsStore)).toEqual([]);
      expect(spyRegisterVote).not.toBeCalled();

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(get(toastsStore)).toEqual([]);
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
      expect(get(toastsStore)).toEqual([]);

      await registerNnsVotes({
        neuronIds: [],
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          throw new Error("test");
        },
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "info",
          text: `Rejecting proposal ${proposalTypeName} (${proposal.id}). Updating proposal state...`,
        },
        {
          level: "error",
          text: "Sorry, there was an unexpected error while registering the vote. Please try again later. test",
        },
      ]);
    });

    it("should show error.register_vote on nns-js-based errors", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteError
      );
      expect(get(toastsStore)).toEqual([]);

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `Sorry, there was an error while registering the vote for the proposal ${proposalTypeName} (${proposal.id}). Please try again. 0: test, 1: test, 2: test`,
        },
      ]);
    });

    it("should display proopsalId in error detail", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteError
      );
      expect(get(toastsStore)).toEqual([]);

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `Sorry, there was an error while registering the vote for the proposal ${proposalTypeName} (${proposal.id}). Please try again. 0: test, 1: test, 2: test`,
        },
      ]);
    });

    it("should show reason per neuron Error in detail", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteError
      );
      expect(get(toastsStore)).toEqual([]);

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      // expect(error?.detail?.split(/test/).length).toBe(neuronIds.length + 1);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `Sorry, there was an error while registering the vote for the proposal ${proposalTypeName} (16). Please try again. ${neuronIds.map((_, i) => `${i}: test`).join(", ")}`,
        },
      ]);
    });

    it("should show reason per neuron GovernanceError in detail", async () => {
      vi.spyOn(governanceApi, "registerVote").mockImplementation(
        mockRegisterVoteGovernanceError
      );
      expect(get(toastsStore)).toEqual([]);

      await registerNnsVotes({
        neuronIds,
        proposalInfo: proposal,
        vote: Vote.No,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `Sorry, there was an error while registering the vote for the proposal ${proposalTypeName} (${proposal.id}). Please try again. ${neuronIds.map((_, i) => `${i}: governance-error`).join(", ")}`,
        },
      ]);
    });
  });

  describe("identity errors", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      setNoIdentity();
    });

    it("should display error if no identity", async () => {
      expect(get(toastsStore)).toEqual([]);

      await registerNnsVotes({
        neuronIds: [0n],
        proposalInfo: proposal,
        vote: Vote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "info",
          text: `Adopting proposal ${proposalTypeName} (${proposal.id}). Neurons registered: 0/1. Keep the dapp open until completed.`,
        },
        {
          level: "error",
          text: "Sorry, there was an unexpected error while registering the vote. Please try again later. The operation cannot be executed without any identity.",
        },
      ]);
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

      expect(get(toastsStore)).toEqual([]);

      processRegisterVoteErrors({
        registerVoteResponses,
        neuronIdStrings,
        proposalIdString,
        proposalType,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `Sorry, there was an error while registering the vote for the proposal ${proposalType} (${proposalIdString}). Please try again. 01: test`,
        },
      ]);
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

      expect(get(toastsStore)).toEqual([]);

      processRegisterVoteErrors({
        registerVoteResponses,
        neuronIdStrings,
        proposalIdString,
        proposalType,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `Sorry, there was an error while registering the vote for the proposal ${proposalType} (${proposalIdString}). Please try again. 02: test, 04: critical test`,
        },
      ]);
    });
  });
});
