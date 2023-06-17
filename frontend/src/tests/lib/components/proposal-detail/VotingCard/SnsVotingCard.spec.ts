/**
 * @jest-environment jsdom
 */

import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import SnsVotingCard from "$lib/components/sns-proposals/SnsVotingCard.svelte";
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
import en from "$tests/mocks/i18n.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { mockSnsCanisterId } from "$tests/mocks/sns.api.mock";
import { NeuronState, Vote } from "@dfinity/nns";
import type { SnsNeuron, SnsProposalData } from "@dfinity/sns";
import { SnsNeuronPermissionType, SnsVote, type SnsBallot } from "@dfinity/sns";
import type { NeuronPermission } from "@dfinity/sns/dist/candid/sns_governance";
import { fromDefinedNullable } from "@dfinity/utils";
import { fireEvent, screen } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

describe("SnsVotingCard", () => {
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
  const testProposal: SnsProposalData = {
    ...mockSnsProposal,
    ballots: testBallots,
    proposal_creation_timestamp_seconds: BigInt(Date.now()),
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
      }),
      permissions: permissionsWithTypeVote,
    },
    {
      ...createMockSnsNeuron({
        id: [2],
        state: NeuronState.Locked,
      }),
      permissions: permissionsWithTypeVote,
    },
  ];
  const spyRegisterVote = jest
    .spyOn(snsGovernanceApi, "registerVote")
    .mockResolvedValue();
  const spyOnReloadProposal = jest.fn();
  const renderVotingCard = () =>
    render(SnsVotingCard, {
      props: {
        proposal: testProposal,
        reloadProposal: spyOnReloadProposal,
      },
    });

  beforeEach(() => {
    snsNeuronsStore.reset();
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    spyOnReloadProposal.mockClear();
    spyRegisterVote.mockClear();

    page.mock({ data: { universe: mockSnsCanisterId.toText() } });

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

    expect(() => expect(getByTestId("voting-confirmation-toolbar"))).toThrow();
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
    const { container } = renderVotingCard();
    expect(container.querySelector("button[disabled]")).toBeNull();
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

    const { getByText } = renderVotingCard();
    expect(getByText(en.proposal_detail.my_votes)).toBeInTheDocument();
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

    const { getByText } = renderVotingCard();
    expect(getByText(en.proposal_detail.my_votes)).toBeInTheDocument();
  });

  describe("voting", () => {
    it("should trigger register-vote and call reloadProposal", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(screen.queryByTestId("vote-yes") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

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

      renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(screen.queryByTestId("vote-yes") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

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

      renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(screen.queryByTestId("vote-no") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

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
