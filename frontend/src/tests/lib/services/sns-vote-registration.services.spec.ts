import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { registerSnsVotes } from "$lib/services/sns-vote-registration.services";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { NeuronState } from "@dfinity/nns";
import type { SnsProposalData } from "@dfinity/sns";
import { SnsVote } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";

describe("sns-vote-registration-services", () => {
  const rootCanisterId = mockPrincipal;
  const neurons = [
    createMockSnsNeuron({
      id: [1],
      stake: 1n,
      state: NeuronState.Locked,
    }),
    createMockSnsNeuron({
      id: [2],
      stake: 2n,
      state: NeuronState.Locked,
    }),
    createMockSnsNeuron({
      id: [3],
      stake: 3n,
      state: NeuronState.Locked,
    }),
  ];
  const spyOnToastsUpdate = vi.spyOn(toastsStore, "toastsUpdate");
  const spyOnToastsShow = vi.spyOn(toastsStore, "toastsShow");
  const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");
  const proposal: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 123n }],
    // map to the function id
    action: nervousSystemFunctionMock.id,
    // enable voting in ballots
    ballots: neurons.map((neuron) => [
      getSnsNeuronIdAsHexString(neuron),
      {
        vote: SnsVote.Unspecified,
        cast_timestamp_seconds: 456n,
        voting_power: 98441n,
      },
    ]),
  };
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
      proposal,
      vote,
      updateProposalCallback: reloadProposalCallback,
    });

  beforeEach(() => {
    vi.clearAllMocks();

    snsFunctionsStore.setProjectFunctions({
      rootCanisterId,
      nsFunctions: [nervousSystemFunctionMock],
      certified: true,
    });
    snsProposalsStore.setProposals({
      rootCanisterId,
      certified: true,
      completed: true,
      proposals: [proposal],
    });

    spyOnToastsUpdate.mockClear();
    spyOnToastsError.mockClear();
    spyOnToastsShow.mockClear();
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

    it("should display a correct error details", async () => {
      const spyRegisterVoteApi = vi
        .spyOn(snsGovernanceApi, "registerVote")
        .mockRejectedValue(new Error("test error"));
      const spyReloadProposalCallback = vi.fn();

      await callRegisterVote({
        vote: SnsVote.Yes,
        reloadProposalCallback: spyReloadProposalCallback,
      });

      const votableNeuronCount = neurons.length;
      await waitFor(() =>
        expect(spyRegisterVoteApi).toBeCalledTimes(votableNeuronCount)
      );

      expect(spyOnToastsShow).toBeCalledWith({
        detail: "01: test error, 02: test error, 03: test error",
        labelKey: "error.register_vote",
        level: "error",
        substitutions: {
          $proposalId: "123",
          $proposalType: "Governance",
        },
      });
    });
  });
});
