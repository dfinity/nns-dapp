import * as api from "$lib/api/sns-governance.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import * as actionableProposalsService from "$lib/services/actionable-proposals.services";
import { registerSnsVotes } from "$lib/services/sns-vote-registration.services";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { enumValues } from "$lib/utils/enum.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsBallot, SnsProposalData } from "@dfinity/sns";
import {
  SnsNeuronPermissionType,
  SnsProposalRewardStatus,
  SnsVote,
} from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sns-vote-registration-services", () => {
  const rootCanisterId = mockPrincipal;
  const allPermissions = [
    {
      principal: [mockIdentity.getPrincipal()] as [Principal],
      permission_type: Int32Array.from(enumValues(SnsNeuronPermissionType)),
    },
  ];
  const neurons = [
    createMockSnsNeuron({
      id: [1],
      stake: 1n,
      state: NeuronState.Locked,
      permissions: allPermissions,
      createdTimestampSeconds: 0n,
    }),
    createMockSnsNeuron({
      id: [2],
      stake: 2n,
      state: NeuronState.Locked,
      permissions: allPermissions,
      createdTimestampSeconds: 0n,
    }),
    createMockSnsNeuron({
      id: [3],
      stake: 3n,
      state: NeuronState.Locked,
      permissions: allPermissions,
      createdTimestampSeconds: 0n,
    }),
  ];
  const testBallots = neurons.map((neuron) => [
    getSnsNeuronIdAsHexString(neuron),
    {
      vote: SnsVote.Unspecified,
      cast_timestamp_seconds: 456n,
      voting_power: 98441n,
    },
  ]) as [string, SnsBallot][];
  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 123n }],
    action: nervousSystemFunctionMock.id,
    ballots: testBallots,
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 321n }],
    action: nervousSystemFunctionMock.id,
    ballots: testBallots,
  };
  let resolveQuerySnsProposals;
  let spyQuerySnsProposals;
  let spyQuerySnsNeurons;
  const callRegisterVote = async ({
    vote,
    reloadProposalCallback,
  }: {
    vote: SnsVote;
    reloadProposalCallback: (proposal: SnsProposalData) => void;
  }) =>
    await registerSnsVotes({
      universeCanisterId: rootCanisterId,
      neurons,
      proposal: proposal1,
      vote,
      updateProposalCallback: reloadProposalCallback,
    });

  beforeEach(() => {
    resetIdentity();
    vi.restoreAllMocks();
    toastsStore.reset();

    spyQuerySnsProposals = vi
      .spyOn(api, "queryProposals")
      .mockReturnValue(
        new Promise((resolve) => (resolveQuerySnsProposals = resolve))
      );
    spyQuerySnsNeurons = vi
      .spyOn(api, "querySnsNeurons")
      .mockResolvedValue([...neurons]);

    setSnsProjects([
      {
        rootCanisterId,
        nervousFunctions: [nervousSystemFunctionMock],
      },
    ]);
    snsProposalsStore.setProposals({
      rootCanisterId,
      certified: true,
      completed: true,
      proposals: [proposal1],
    });
  });

  describe("registerSnsVotes", () => {
    it("should make an sns registerVote api call per neuron", async () => {
      const spyRegisterVoteApi = vi
        .spyOn(snsGovernanceApi, "registerVote")
        .mockResolvedValue();
      await callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: vi.fn(),
      });

      const votableNeuronCount = neurons.length;
      expect(spyRegisterVoteApi).toBeCalledTimes(votableNeuronCount);

      for (const neuron of neurons) {
        expect(spyRegisterVoteApi).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(neuron.id),
            rootCanisterId,
            proposalId: { id: 123n },
            vote: SnsVote.Yes,
          })
        );
      }
    });

    it("should call updateProposalContext after single neuron voting", async () => {
      const spyRegisterVoteApi = vi
        .spyOn(snsGovernanceApi, "registerVote")
        .mockResolvedValue();
      const spyReloadProposalCallback = vi.fn();

      callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: spyReloadProposalCallback,
      });

      expect(spyReloadProposalCallback).toBeCalledTimes(0);

      const votableNeuronCount = neurons.length;
      await waitFor(() =>
        expect(spyRegisterVoteApi).toBeCalledTimes(votableNeuronCount)
      );

      expect(spyReloadProposalCallback).toBeCalledTimes(votableNeuronCount);
    });

    it("should call updateProposalContext with optimistically updated proposal", async () => {
      const spyRegisterVoteApi = vi
        .spyOn(snsGovernanceApi, "registerVote")
        .mockResolvedValue();
      const spyReloadProposalCallback = vi.fn();

      await callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: spyReloadProposalCallback,
      });

      const votableNeuronCount = neurons.length;
      await waitFor(() =>
        expect(spyRegisterVoteApi).toBeCalledTimes(votableNeuronCount)
      );

      expect(spyReloadProposalCallback).toBeCalledWith(
        expect.objectContaining({
          ballots: neurons.map((neuron) => [
            getSnsNeuronIdAsHexString(neuron),
            expect.objectContaining({
              vote: SnsVote.Yes,
            }),
          ]),
        })
      );
    });

    it("should reload actionable sns proposals after voting", async () => {
      vi.spyOn(snsGovernanceApi, "registerVote").mockResolvedValue();
      const rootCanisterId2 = principal(13);
      actionableSnsProposalsStore.set({
        rootCanisterId,
        proposals: [proposal1, proposal2],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: rootCanisterId2,
        proposals: [proposal1, proposal2],
      });

      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId.toText()]: {
          proposals: [proposal1, proposal2],
        },
        [rootCanisterId2.toText()]: {
          proposals: [proposal1, proposal2],
        },
      });
      expect(spyQuerySnsProposals).toBeCalledTimes(0);
      expect(spyQuerySnsNeurons).toBeCalledTimes(0);

      await callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyQuerySnsProposals).toBeCalledTimes(1);
      expect(spyQuerySnsProposals).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        params: {
          beforeProposal: undefined,
          includeRewardStatus: [
            SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
          ],
          limit: 20,
        },
        rootCanisterId,
      });
      expect(spyQuerySnsNeurons).toBeCalledTimes(0);

      // The store value should be not changed until the proposals are loaded
      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId.toText()]: {
          proposals: [proposal1, proposal2],
        },
        [rootCanisterId2.toText()]: {
          proposals: [proposal1, proposal2],
        },
      });

      // wait for actionable sns proposals loading
      resolveQuerySnsProposals({
        proposals: [proposal1],
        include_ballots_by_caller: [true],
      });
      await runResolvedPromises();

      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId.toText()]: {
          proposals: [proposal1],
        },
        [rootCanisterId2.toText()]: {
          proposals: [proposal1, proposal2],
        },
      });
    });

    it("should not reset actionable nns proposals after voting", async () => {
      vi.spyOn(snsGovernanceApi, "registerVote").mockResolvedValue();
      const spyLoadActionableProposalsNns = vi.spyOn(
        actionableProposalsService,
        "loadActionableProposals"
      );
      const rootCanisterId2 = principal(13);
      actionableSnsProposalsStore.set({
        rootCanisterId,
        proposals: [proposal1, proposal2],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: rootCanisterId2,
        proposals: [proposal1, proposal2],
      });

      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId.toText()]: {
          proposals: [proposal1, proposal2],
        },
        [rootCanisterId2.toText()]: {
          proposals: [proposal1, proposal2],
        },
      });
      expect(spyQuerySnsProposals).toBeCalledTimes(0);
      expect(spyLoadActionableProposalsNns).toBeCalledTimes(0);

      await callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyQuerySnsProposals).toBeCalledTimes(1);
      expect(spyLoadActionableProposalsNns).toBeCalledTimes(0);
    });

    it("should display a correct error details", async () => {
      const spyRegisterVoteApi = vi
        .spyOn(snsGovernanceApi, "registerVote")
        .mockRejectedValue(new Error("test error"));
      const spyReloadProposalCallback = vi.fn();

      expect(get(toastsStore)).toEqual([]);

      await callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: spyReloadProposalCallback,
      });

      const votableNeuronCount = neurons.length;
      await waitFor(() =>
        expect(spyRegisterVoteApi).toBeCalledTimes(votableNeuronCount)
      );

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, there was an error while registering the vote for the proposal Governance (123). Please try again. 01: test error, 02: test error, 03: test error",
        },
      ]);
    });
  });
});
