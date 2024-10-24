import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  ProposalRewardStatus,
  ProposalStatus,
  type Ballot,
  type NeuronInfo,
} from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalVotingSectionTest from "./ProposalVotingSectionTest.svelte";

describe("ProposalVotingSection", () => {
  const neuronIds = [111, 222].map(BigInt);

  const proposalTimestampSeconds = 100n;
  const ineligibleNeuron = {
    ...mockNeuron,
    createdTimestampSeconds: proposalTimestampSeconds + 1n,
  } as NeuronInfo;

  const neurons: NeuronInfo[] = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    createdTimestampSeconds: BigInt(1_000n),
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
    vi.resetAllMocks();
  });

  const proposalInfo = {
    ...mockProposalInfo,
    ballots: neuronIds.map((neuronId) => ({ neuronId }) as Ballot),
    proposalTimestampSeconds: 2_000n,
    status: ProposalStatus.Open,
  };

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
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
      expect(getByTestId("voting-neuron-select")).toBeInTheDocument();
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
    beforeEach(() => {
      setNoIdentity();
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
