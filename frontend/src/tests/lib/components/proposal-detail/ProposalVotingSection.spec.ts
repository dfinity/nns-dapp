/**
 * @jest-environment jsdom
 */

import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  ProposalRewardStatus,
  ProposalStatus,
  type Ballot,
  type NeuronInfo,
} from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import ProposalVotingSectionTest from "./ProposalVotingSectionTest.svelte";

describe("ProposalVotingSection", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  const neuronIds = [111, 222].map(BigInt);

  const proposalTimestampSeconds = BigInt(100);
  const ineligibleNeuron = {
    ...mockNeuron,
    createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
  } as NeuronInfo;

  const neurons: NeuronInfo[] = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    createdTimestampSeconds: BigInt(BigInt(1000)),
    dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    neuronId,
  }));

  beforeAll(() =>
    neuronsStore.setNeurons({
      neurons: [...neurons, ineligibleNeuron],
      certified: true,
    })
  );

  afterAll(() => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    jest.resetAllMocks();
  });

  const proposalInfo = {
    ...mockProposalInfo,
    ballots: neuronIds.map((neuronId) => ({ neuronId } as Ballot)),
    proposalTimestampSeconds: BigInt(2000),
    status: ProposalStatus.Open,
  };

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should render vote blocks", () => {
      const { queryByText, getByTestId } = render(ProposalVotingSectionTest, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            rewardStatus: ProposalRewardStatus.AcceptVotes,
          },
        },
      });

      expect(
        queryByText(en.proposal_detail.voting_results)
      ).toBeInTheDocument();
      expect(getByTestId("voting-confirmation-toolbar")).toBeInTheDocument();
      expect(
        queryByText(en.proposal_detail__ineligible.headline)
      ).toBeInTheDocument();
    });

    it("should not render vote blocks if reward status has settled", () => {
      const { queryByText, getByTestId } = render(ProposalVotingSectionTest, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            rewardStatus: ProposalRewardStatus.Settled,
          },
        },
      });

      expect(
        queryByText(en.proposal_detail.voting_results)
      ).toBeInTheDocument();
      expect(() => getByTestId("voting-confirmation-toolbar")).toThrow();
      expect(queryByText(en.proposal_detail__ineligible.headline)).toBeNull();
    });
  });

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should not render vote blocks", () => {
      const { queryByText, getByTestId } = render(ProposalVotingSectionTest, {
        props: {
          proposalInfo,
        },
      });

      expect(() => getByTestId("voting-confirmation-toolbar")).toThrow();
      expect(queryByText(en.proposal_detail__ineligible.headline)).toBeNull();
    });
  });
});
