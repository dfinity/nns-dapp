import * as api from "$lib/api/sns-governance.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import SnsVotingCard from "$lib/components/sns-proposals/SnsVotingCard.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { mockSnsCanisterId } from "$tests/mocks/sns.api.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { NeuronState, Vote } from "@dfinity/nns";
import type { SnsNeuron, SnsProposalData } from "@dfinity/sns";
import {
  SnsNeuronPermissionType,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  SnsVote,
  type SnsBallot,
} from "@dfinity/sns";
import type { NeuronPermission } from "@dfinity/sns/dist/candid/sns_governance";
import { fromDefinedNullable } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

describe("SnsVotingCard", () => {
  const nowInSeconds = 1689843195;
  const testBallots: [string, SnsBallot][] = [
    [
      "01",
      {
        vote: SnsVote.Unspecified,
        cast_timestamp_seconds: 123n,
        voting_power: 10000n,
      },
    ],
    [
      "02",
      {
        vote: SnsVote.Unspecified,
        cast_timestamp_seconds: 123n,
        voting_power: 10000n,
      },
    ],
    [
      "03",
      {
        vote: SnsVote.Yes,
        cast_timestamp_seconds: 123n,
        voting_power: 10000n,
      },
    ],
  ];
  const neuronCreatedAt = BigInt(nowInSeconds - SECONDS_IN_DAY * 2);
  const proposalCreatedAt = BigInt(nowInSeconds - SECONDS_IN_DAY);
  const testProposal: SnsProposalData = {
    ...createSnsProposal({
      proposalId: 123n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      ballots: testBallots,
      createdAt: proposalCreatedAt,
    }),
  };
  const permissionsWithTypeVote = [
    {
      principal: [mockIdentity.getPrincipal()],
      permission_type: Int32Array.from([
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
      ]),
    } as NeuronPermission,
  ];

  const testNeurons: SnsNeuron[] = [
    {
      ...createMockSnsNeuron({
        id: [1],
        state: NeuronState.Locked,
        createdTimestampSeconds: neuronCreatedAt,
      }),
      permissions: permissionsWithTypeVote,
    },
    {
      ...createMockSnsNeuron({
        id: [2],
        state: NeuronState.Locked,
        createdTimestampSeconds: neuronCreatedAt,
        // Should also work with NF neurons the same way as with own neurons
        sourceNnsNeuronId: 12345n,
      }),
      permissions: permissionsWithTypeVote,
    },
  ];
  const spyRegisterVote = vi
    .spyOn(snsGovernanceApi, "registerVote")
    .mockResolvedValue();
  const spyOnReloadProposal = vi.fn();
  const renderVotingCard = (proposal = testProposal) =>
    render(SnsVotingCard, {
      props: {
        proposal,
        reloadProposal: spyOnReloadProposal,
      },
    });

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(nowInSeconds * 1000);
    snsNeuronsStore.reset();
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    spyOnReloadProposal.mockClear();
    spyRegisterVote.mockClear();

    page.mock({ data: { universe: mockSnsCanisterId.toText() } });

    setSnsProjects([
      {
        rootCanisterId: mockSnsCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);

    snsParametersStore.setParameters({
      rootCanisterId: mockSnsCanisterId,
      parameters: snsNervousSystemParametersMock,
      certified: true,
    });
  });

  it("should be hidden if there is no not-voted-neurons", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [],
      certified: true,
    });
    const { getByTestId } = renderVotingCard();

    expect(getByTestId("voting-confirmation-toolbar")).toBeInTheDocument();
  });

  it("should be visible if there are some not-voted-neurons", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { getByTestId } = renderVotingCard();

    await waitFor(() =>
      expect(getByTestId("voting-confirmation-toolbar")).toBeInTheDocument()
    );
  });

  it("should display votable neurons voting power from ballot", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const proposal: SnsProposalData = {
      ...testProposal,
      ballots: [
        [
          getSnsNeuronIdAsHexString(testNeurons[0]),
          {
            vote: SnsVote.Unspecified,
            cast_timestamp_seconds: 0n,
            voting_power: 314_000_000n,
          },
        ],
        [
          getSnsNeuronIdAsHexString(testNeurons[1]),
          {
            vote: SnsVote.Unspecified,
            cast_timestamp_seconds: 0n,
            voting_power: 100_000_000n,
          },
        ],
      ],
    };

    const { queryAllByTestId } = render(SnsVotingCard, {
      props: {
        proposal,
        reloadProposal: spyOnReloadProposal,
      },
    });

    const elements = queryAllByTestId("voting-neuron-select-voting-power");

    expect(elements[0]).toHaveTextContent("3.14");
    expect(elements[1]).toHaveTextContent("1.00");
  });

  it("should disable action buttons if no neurons selected", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { container } = renderVotingCard();
    // remove neuron selection
    votingNeuronSelectStore.reset();
    // wait for UI update (src/lib/components/proposal-detail/VotingCard/SnsVotingCard.svelte#34)
    await tick();
    expect(container.querySelectorAll("button[disabled]").length).toBe(2);
  });

  it("should enable action buttons when neurons are selected", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { queryByTestId } = renderVotingCard();
    expect(queryByTestId("vote-yes")).toBeInTheDocument();
    expect(queryByTestId("vote-no")).toBeInTheDocument();
  });

  it("should enable action buttons when neurons are selected for executed proposals", async () => {
    const executedProposal = createSnsProposal({
      proposalId: 123n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      ballots: testBallots,
      createdAt: proposalCreatedAt,
    });
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { queryByTestId } = renderVotingCard(executedProposal);
    expect(queryByTestId("vote-yes")).toBeInTheDocument();
    expect(queryByTestId("vote-no")).toBeInTheDocument();
  });

  it("should display votable neurons", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [
        ...testNeurons,
        // voted neuron
        {
          ...createMockSnsNeuron({
            id: [3],
            state: NeuronState.Locked,
          }),
        },
      ],
      certified: true,
    });

    const { getByTestId } = renderVotingCard();
    expect(getByTestId("votable-neurons")).toBeInTheDocument();
  });

  it("should display my votes", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [
        ...testNeurons,
        // voted neuron
        {
          ...createMockSnsNeuron({
            id: [3],
            state: NeuronState.Locked,
          }),
        },
      ],
      certified: true,
    });

    const { getByTestId } = renderVotingCard();
    expect(getByTestId("voted-neurons")).toBeInTheDocument();
  });

  it("should display ineligible neurons", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [
        ...testNeurons,
        // voted neuron
        {
          ...createMockSnsNeuron({
            id: [3],
            state: NeuronState.Unspecified,
            // Neuron is ineligible because it has no vote permission
            permissions: [],
          }),
        },
      ],
      certified: true,
    });

    const { getByTestId } = renderVotingCard();
    expect(getByTestId("ineligible-neurons")).toBeInTheDocument();
  });

  it("should display my votes with ballot voting power", async () => {
    const votedNeuron = {
      ...createMockSnsNeuron({
        id: [3],
        state: NeuronState.Locked,
      }),
    };
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [...testNeurons, votedNeuron],
      certified: true,
    });

    const proposal: SnsProposalData = {
      ...testProposal,
      ballots: [
        [
          getSnsNeuronIdAsHexString(votedNeuron),
          {
            vote: SnsVote.Yes,
            cast_timestamp_seconds: 123n,
            voting_power: 314_000_000n,
          },
        ],
      ],
    };

    const { getByTestId } = render(SnsVotingCard, {
      props: {
        proposal,
        reloadProposal: spyOnReloadProposal,
      },
    });
    expect(getByTestId("my-votes-voting-power")).toHaveTextContent("3.14");
  });

  it("should display my votes also when all neurons were voted (#2501)", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [
        {
          ...createMockSnsNeuron({
            id: [3],
            state: NeuronState.Locked,
          }),
        },
      ],
      certified: true,
    });

    const { getByTestId } = renderVotingCard();
    expect(getByTestId("voted-neurons")).toBeInTheDocument();
  });

  describe("voting", () => {
    const spyQuerySnsProposals = vi
      .spyOn(api, "queryProposals")
      .mockResolvedValue({
        proposals: [],
        include_ballots_by_caller: [true],
      });

    beforeEach(() => {
      spyQuerySnsProposals.mockClear();
    });

    it("should trigger register-vote and call reloadProposal", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      const { queryByTestId } = renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(queryByTestId("vote-yes") as Element);
      await fireEvent.click(queryByTestId("confirm-yes") as Element);

      // w/o restoreRealTimers() waitFor calls the callback only twice (instead of till the end of the timeout/5000ms)
      // this bug makes the spyOnReloadProposal test fail
      vi.useRealTimers();

      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledTimes(testNeurons.length)
      );
      await waitFor(() => expect(spyOnReloadProposal).toBeCalledTimes(1));
    });

    it("should trigger register-vote YES", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      const { queryByTestId } = renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(queryByTestId("vote-yes") as Element);
      await fireEvent.click(queryByTestId("confirm-yes") as Element);

      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[0].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.Yes,
          })
        )
      );
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[1].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.Yes,
          })
        )
      );
    });

    it("should trigger register-vote NO", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      const { queryByTestId } = renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(queryByTestId("vote-no") as Element);
      await fireEvent.click(queryByTestId("confirm-yes") as Element);

      await waitFor(() =>
        expect(spyRegisterVote).toHaveBeenCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[0].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.No,
          })
        )
      );
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[1].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.No,
          })
        )
      );
    });
  });
});
