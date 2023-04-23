import { i18n } from "$lib/stores/i18n";
import {
  toastsError,
  toastsHide,
  toastsShow,
  toastsUpdate,
} from "$lib/stores/toasts.store";
import {
  voteRegistrationStore,
  type VoteRegistrationStoreEntry,
} from "$lib/stores/vote-registration.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { registerVoteErrorDetails } from "$lib/utils/proposals.utils";
import { Vote } from "@dfinity/nns";
import type { SnsVote } from "@dfinity/sns";
import { assertNonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

/**
 * Reflects vote registration status with a toast messages
 * (regardless of neuron type nns/sns)
 */
export const manageVotesRegistration = async ({
  universeCanisterId,
  neuronIdStrings,
  proposalIdString,
  proposalType,
  vote,
  registerNeuronVotes,
  postRegistration,
}: {
  universeCanisterId: UniverseCanisterId;
  neuronIdStrings: string[];
  proposalIdString: string;
  proposalType: string;
  vote: Vote | SnsVote;
  registerNeuronVotes: (toastId: symbol) => Promise<void>;
  postRegistration: () => Promise<void>;
}): Promise<void> => {
  try {
    const toastId = createRegisterVotesToast({
      vote,
      proposalIdString,
      proposalType,
      neuronIdStrings,
    });
    voteRegistrationStore.add({
      vote,
      proposalIdString,
      neuronIdStrings,
      canisterId: universeCanisterId,
    });

    await registerNeuronVotes(toastId);

    voteRegistrationStore.updateStatus({
      proposalIdString,
      status: "post-update",
      canisterId: universeCanisterId,
    });

    // update the toast state (voting -> updating the data)
    const { successfullyVotedNeuronIdStrings } = voteRegistrationByProposal({
      proposalIdString,
      universeCanisterId,
    });
    updateVoteRegistrationToastMessage({
      toastId,
      proposalIdString,
      proposalType,
      neuronIdStrings,
      successfullyVotedNeuronIdStrings,
      registrationDone: true,
      vote,
    });

    await postRegistration();

    // cleanup
    toastsHide(toastId);
    voteRegistrationStore.remove({
      proposalIdString,
      canisterId: universeCanisterId,
    });
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsError({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};

export const createRegisterVotesToast = ({
  vote,
  proposalIdString,
  proposalType,
  neuronIdStrings,
}: {
  vote: Vote | SnsVote;
  proposalIdString: string;
  proposalType: string;
  neuronIdStrings: string[];
}): symbol => {
  const $i18n = get(i18n);
  const totalNeurons = neuronIdStrings.length;
  const status = replacePlaceholders(
    $i18n.proposal_detail__vote.vote_status_registering,
    {
      $completed: `0`,
      $amount: `${totalNeurons}`,
    }
  );

  return toastsShow({
    labelKey:
      vote === Vote.Yes
        ? "proposal_detail__vote.vote_adopt_in_progress"
        : "proposal_detail__vote.vote_reject_in_progress",
    level: "info",
    spinner: true,
    substitutions: {
      $proposalId: proposalIdString,
      $proposalType: proposalType,
      $status: status,
    },
  });
};

export const voteRegistrationByProposal = ({
  universeCanisterId,
  proposalIdString,
}: {
  universeCanisterId: UniverseCanisterId;
  proposalIdString: string;
}): VoteRegistrationStoreEntry => {
  const registration = get(voteRegistrationStore).registrations[
    universeCanisterId.toText()
  ].find(({ proposalIdString: id }) => id === proposalIdString);

  assertNonNullish(registration);

  return registration;
};

/** Reflects vote registration in a toast message */
export const updateVoteRegistrationToastMessage = ({
  toastId,
  proposalIdString,
  proposalType,
  neuronIdStrings,
  successfullyVotedNeuronIdStrings,
  registrationDone,
  vote,
}: {
  toastId: symbol;
  proposalIdString: string;
  proposalType: string;
  neuronIdStrings: string[];
  successfullyVotedNeuronIdStrings: string[];
  registrationDone: boolean;
  vote: Vote | SnsVote;
}) => {
  const $i18n = get(i18n);
  const totalNeurons = neuronIdStrings.length;
  const completeNeurons = successfullyVotedNeuronIdStrings.length;
  const status = registrationDone
    ? $i18n.proposal_detail__vote.vote_status_updating
    : replacePlaceholders($i18n.proposal_detail__vote.vote_status_registering, {
        $completed: `${completeNeurons}`,
        $amount: `${totalNeurons}`,
      });

  toastsUpdate({
    id: toastId,
    content: {
      labelKey:
        vote === Vote.Yes
          ? "proposal_detail__vote.vote_adopt_in_progress"
          : "proposal_detail__vote.vote_reject_in_progress",
      level: "info",
      spinner: true,
      substitutions: {
        $proposalId: proposalIdString,
        $proposalType: proposalType,
        $status: status,
      },
    },
  });
};

export const processRegisterVoteErrors = ({
  registerVoteResponses,
  neuronIdStrings,
  proposalIdString,
  proposalType,
}: {
  registerVoteResponses: PromiseSettledResult<void>[];
  neuronIdStrings: string[];
  proposalIdString: string;
  proposalType: string;
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
      neuronIdStrings,
    });

    toastsShow({
      labelKey: "error.register_vote",
      level: "error",
      substitutions: {
        $proposalId: proposalIdString,
        $proposalType: proposalType,
      },
      detail: details.join(", "),
    });
  }
};
