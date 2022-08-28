import type { Identity } from "@dfinity/agent";
import {
  Topic,
  Vote,
  type NeuronId,
  type ProposalId,
  type ProposalInfo,
} from "@dfinity/nns";
import { assertNonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { registerVote } from "../api/proposals.api";
import { i18n } from "../stores/i18n";
import { definedNeuronsStore, neuronsStore } from "../stores/neurons.store";
import { proposalsStore } from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import {
  voteRegistrationStore,
  type VoteRegistration,
} from "../stores/vote-registration.store";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { replacePlaceholders } from "../utils/i18n.utils";
import { updateNeuronsVote } from "../utils/neuron.utils";
import {
  registerVoteErrorDetails,
  updateProposalVote,
} from "../utils/proposals.utils";
import { waitForMilliseconds } from "../utils/utils";
import { getIdentity } from "./auth.services";
import { listNeurons } from "./neurons.services";
import { loadProposal } from "./proposals.services";

/**
 * Create Makes multiple registerVote calls (1 per neuronId).
 *
 * In order to improve UX optimistic UI update is used: after every successful neuron vote registration (`registerVote`) we mock the data (both proposal and voted neuron) and update the stores with optimistic values.
 */
export const registerVotes = async ({
  neuronIds,
  proposalInfo,
  vote,
  reloadProposalCallback: updateProposalContext,
}: {
  neuronIds: NeuronId[];
  proposalInfo: ProposalInfo;
  vote: Vote;
  reloadProposalCallback: (proposalInfo: ProposalInfo) => void;
}): Promise<void> => {
  try {
    const toastId = createRegisterVotesToast({ vote, proposalInfo, neuronIds });
    const voteRegistration: VoteRegistration = voteRegistrationStore.create({
      vote,
      proposalInfo,
      neuronIds,
      toastId,
    });

    voteRegistrationStore.updateStatus({
      voteRegistration,
      status: "vote-registration",
    });

    await registerNeuronsVote({
      neuronIds,
      proposalInfo,
      vote,
      updateProposalContext,
    });

    voteRegistrationStore.updateStatus({
      voteRegistration,
      status: "post-update",
    });

    updateVoteRegistrationToastMessage(voteRegistration);

    const updatedProposalInfo = await updateAfterVoteRegistration(
      proposalInfo.id as ProposalId
    );
    proposalsStore.replaceProposals([updatedProposalInfo]);
    updateProposalContext(updatedProposalInfo);

    voteRegistrationStore.updateStatus({
      voteRegistration,
      status: "complete",
    });

    toastsStore.hide(toastId);

    voteRegistrationStore.removeCompleted();
  } catch (err) {
    console.error("process voting unknown", err);

    toastsStore.error({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};

const registerVotesStatus = ({
  totalNeurons,
  completeNeurons,
}: {
  totalNeurons: number;
  completeNeurons: number;
}): string => {
  const $i18n = get(i18n);
  return completeNeurons < totalNeurons
    ? replacePlaceholders($i18n.proposal_detail__vote.vote_status_registering, {
        $completed: `${completeNeurons}`,
        $amount: `${totalNeurons}`,
      })
    : $i18n.proposal_detail__vote.vote_status_updating;
};

const createRegisterVotesToast = ({
  vote,
  proposalInfo,
  neuronIds,
}: {
  vote: Vote;
  proposalInfo: ProposalInfo;
  neuronIds: NeuronId[];
}): symbol => {
  const $i18n = get(i18n);
  const { id, topic } = proposalInfo;
  const totalNeurons = neuronIds.length;

  return toastsStore.show({
    labelKey:
      vote === Vote.YES
        ? "proåposal_detail__vote.vote_adopt_in_progress"
        : "proposal_detail__vote.vote_reject_in_progress",
    level: "info",
    spinner: true,
    substitutions: {
      $proposalId: `${id}`,
      $topic: $i18n.topics[Topic[topic]],
      $status: registerVotesStatus({
        totalNeurons,
        completeNeurons: 0,
      }),
    },
  });
};

const neuronRegistrationComplete = ({
  neuronId,
  proposalId,
  updateProposalContext,
}: {
  neuronId: NeuronId;
  proposalId: ProposalId;
  updateProposalContext: (proposal: ProposalInfo) => void;
}) => {
  const voteRegistration = get(voteRegistrationStore).registrations.find(
    ({ proposalInfo: { id } }) => id === proposalId
  ) as VoteRegistration;
  const { vote, proposalInfo } = voteRegistration;
  const $definedNeuronsStore = get(definedNeuronsStore);
  const originalNeuron = $definedNeuronsStore.find(
    ({ neuronId: id }) => id === neuronId
  );

  // TODO: remove after live testing. In theory it should be always defined here.
  assertNonNullish(originalNeuron, `Neuron ${neuronId} not defined`);

  assertNonNullish(proposalId);

  voteRegistrationStore.addSuccessfullyVotedNeuronId({
    proposalId,
    neuronId,
  });

  // TODO(create a Jira task?): be sure that some previously called proposal fetch update wouldn't ruin the faked data (probably timestamp based)

  // Optimistically update neuron vote state
  const votingNeuron = updateNeuronsVote({
    neuron: originalNeuron,
    vote,
    proposalId,
  });
  neuronsStore.replaceNeurons([votingNeuron]);

  // Optimistically update proposal vote state
  const votingProposal = updateProposalVote({
    proposalInfo,
    neuron: votingNeuron,
    vote,
  });
  // update proposal list with voted proposal to make "hide open" filter work (because of the changes in ballots)
  proposalsStore.replaceProposals([votingProposal]);

  // Update proposal context store
  updateProposalContext(votingProposal);

  updateVoteRegistrationToastMessage(voteRegistration);
};

/** Reflects vote registration in a toast message */
const updateVoteRegistrationToastMessage = (
  voteRegistration: VoteRegistration
) => {
  const $i18n = get(i18n);
  const { toastId, proposalInfo, neuronIds, successfullyVotedNeuronIds } =
    voteRegistration;
  const { id, topic } = proposalInfo;

  const totalNeurons = neuronIds.length;
  const completeNeurons = successfullyVotedNeuronIds.length;
  toastsStore.updateToastContent({
    toastId: toastId as symbol,
    content: {
      substitutions: {
        $proposalId: `${id}`,
        $topic: $i18n.topics[Topic[topic]],
        $status: registerVotesStatus({
          totalNeurons,
          completeNeurons,
        }),
      },
    },
  });
};

const registerNeuronsVote = async ({
  neuronIds,
  proposalInfo,
  vote,
  updateProposalContext,
}: {
  neuronIds: NeuronId[];
  proposalInfo: ProposalInfo;
  vote: Vote;
  updateProposalContext: (proposal: ProposalInfo) => void;
}) => {
  const identity: Identity = await getIdentity();
  const { id, topic } = proposalInfo;
  const proposalId = id as ProposalId;

  try {
    const requests = neuronIds.map(
      (neuronId: NeuronId, index): Promise<void> =>
        // TODO: to remove after local test
        waitForMilliseconds(index * 1000).then(() =>
          registerVote({
            neuronId,
            vote,
            proposalId,
            identity,
          })
            // call it only after successful registration
            .then(() =>
              neuronRegistrationComplete({
                neuronId,
                proposalId,
                updateProposalContext,
              })
            )
        )
    );

    logWithTimestamp(`Registering [${neuronIds.map(hashCode)}] votes call...`);

    const registerVoteResponses = await Promise.allSettled(requests);

    logWithTimestamp(
      `Registering [${neuronIds.map(hashCode)}] votes complete.`
    );

    processRegisterVoteErrors({
      registerVoteResponses,
      neuronIds,
      proposalId,
      topic,
    });
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsStore.error({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};

export const processRegisterVoteErrors = ({
  registerVoteResponses,
  neuronIds,
  proposalId,
  topic,
}: {
  registerVoteResponses: PromiseSettledResult<void>[];
  neuronIds: NeuronId[];
  proposalId: ProposalId;
  topic: Topic;
}) => {
  const rejectedResponses = registerVoteResponses.filter(
    (response: PromiseSettledResult<void>) => {
      const { status } = response;

      // We ignore the error "Neuron already voted on proposal." - i.e. we consider it as a valid response
      // 1. the error truly means the neuron has already voted.
      // 2. if user has for example two neurons with one neuron (B) following another neuron (A). Then if user select both A and B to cast a vote, A will first vote for itself and then vote for the followee B. Then Promise.allSettled above process next neuron B and try to vote again but this vote won't succeed, because it has already been registered by A.
      // TODO(L2-465): discuss with Governance team to either turn the error into a valid response (or warning) with comment or to throw a unique identifier for this particular error.
      const hasAlreadyVoted: boolean =
        "reason" in response &&
        response.reason?.detail?.error_message ===
          "Neuron already voted on proposal.";

      return status === "rejected" && !hasAlreadyVoted;
    }
  );

  if (rejectedResponses.length > 0) {
    const details: string[] = registerVoteErrorDetails({
      responses: registerVoteResponses,
      neuronIds,
    });
    const $i18n = get(i18n);

    console.error("vote", rejectedResponses);

    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      substitutions: {
        $proposalId: `${proposalId}`,
        $topic: $i18n.topics[Topic[topic]],
      },
      detail: details.join(", "),
    });
  }
};

const updateAfterVoteRegistration = async (
  proposalId: ProposalId
): Promise<ProposalInfo> => {
  const reloadProposal = async () =>
    new Promise<ProposalInfo>((setProposal) =>
      loadProposal({
        proposalId,
        setProposal,
        // it will take longer but the query could contain not updated data (e.g. latestTally, votingPower on testnet)
        strategy: "update",
      })
    );

  return Promise.all([
    listNeurons({
      strategy: "update",
    }),
    reloadProposal(),
  ]).then(([_, proposal]) => proposal);
};
