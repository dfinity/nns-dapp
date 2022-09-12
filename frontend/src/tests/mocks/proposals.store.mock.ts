import type { ProposalInfo } from "@dfinity/nns";
import {type Ballot, ProposalRewardStatus, ProposalStatus, Topic, Vote} from "@dfinity/nns";
import type { Subscriber } from "svelte/store";
import type { ProposalsStore } from "../../lib/stores/proposals.store";
import {mockKnownNeuron, mockNeuron} from './neurons.mock';

export const deadlineTimestampSeconds = BigInt(
  Math.round(new Date().getTime() / 1000 + 10000)
);

export const mockProposals: ProposalInfo[] = [
  {
    id: BigInt(404),
    proposal: {
      title: "Proposal1",
      summary:
        "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553",
      action: {
        RegisterKnownNeuron: {
          id: [{ id: BigInt(1) }],
          known_neuron_data: [
            {
              name: "test",
              description: [],
            },
          ],
        },
      },
    },
    status: ProposalStatus.Open,
    rewardStatus: ProposalRewardStatus.AcceptVotes,
    topic: Topic.Governance,
    ballots: [{
      vote: Vote.Unspecified,
      neuronId: mockNeuron.neuronId
    } as Ballot],
    proposer: BigInt(123456789),
    deadlineTimestampSeconds,
  },
  {
    id: BigInt(303),
    proposal: {
      title: "Proposal2",
      summary:
        "Update the NNS subnet tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe in order to grant backup access to three backup pods operated by the DFINITY Foundation. The backup user has only read-only access to the recent blockchain artifacts.",
    },
    status: ProposalStatus.Open,
    rewardStatus: ProposalRewardStatus.AcceptVotes,
    topic: Topic.Governance,
    ballots: [
      {
        vote: Vote.Yes,
        neuronId: mockNeuron.neuronId
      } as Ballot,
    ],
    proposer: BigInt(987654321),
    deadlineTimestampSeconds,
  },
] as unknown as ProposalInfo[];

export const mockProposalsStoreSubscribe = (
  run: Subscriber<ProposalsStore>
): (() => void) => {
  run({ proposals: mockProposals, certified: true });

  return () => undefined;
};

export const mockEmptyProposalsStoreSubscribe = (
  run: Subscriber<ProposalsStore>
): (() => void) => {
  run({ proposals: [], certified: true });

  return () => undefined;
};
