/**
 * @jest-environment jsdom
 */

import { ProposalStatus, type Ballot, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { SECONDS_IN_YEAR } from "../../../../lib/constants/constants";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import ProposalVotingSectionTest from "./ProposalVotingSectionTest.svelte";

describe("ProposalVotingSection", () => {
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

  it("should render vote blocks", async () => {
    const { queryByText } = render(ProposalVotingSectionTest, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          ballots: neuronIds.map((neuronId) => ({ neuronId } as Ballot)),
          proposalTimestampSeconds: BigInt(2000),
          status: ProposalStatus.Open,
        },
      },
    });

    expect(queryByText(en.proposal_detail.voting_results)).toBeInTheDocument();
    expect(queryByText(en.proposal_detail__vote.headline)).toBeInTheDocument();
    expect(
      queryByText(en.proposal_detail__ineligible.headline)
    ).toBeInTheDocument();
  });
});
