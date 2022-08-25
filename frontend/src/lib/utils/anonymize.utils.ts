import {
  ICP,
  type Ballot,
  type Followees,
  type KnownNeuron,
  type Neuron,
  type NeuronInfo,
  type ProposalInfo,
} from "@dfinity/nns";
import type {
  SnsSwapBuyerState,
  SnsSwapDerivedState,
  SnsSwapState,
} from "@dfinity/sns";
import type {
  CanisterDetails,
  Transaction,
} from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
  SnsTokenMetadata,
} from "../types/sns";
import { digestText } from "./dev.utils";
import { mapTransaction } from "./transactions.utils";
import { isNullish, mapPromises, nonNullish } from "./utils";

const anonymiseAvailability = (value: unknown): "yes" | "no" =>
  nonNullish(value) ? "yes" : "no";

export const anonymize = async (value: unknown): Promise<string | undefined> =>
  value === undefined ? undefined : digestText(`${value}`);

/**
 * Use only part of the value to make it not restorable
 */
export const cutAndAnonymize = async (
  value: string | bigint | undefined
): Promise<string | undefined> =>
  value === undefined
    ? undefined
    : await anonymize(
        `${value}`.substring(0, Math.ceil(`${value}`.length * 0.7))
      );

export const anonymizeAmount = async (
  amount: bigint | undefined
): Promise<bigint | undefined> =>
  amount === undefined
    ? undefined
    : BigInt(((await anonymize(amount)) as string).replace(/[A-z]/g, ""));

export const anonymizeICP = async (
  icp: ICP | undefined
): Promise<ICP | undefined> =>
  icp === undefined
    ? undefined
    : icp.toE8s() === BigInt(0)
    ? ICP.fromE8s(BigInt(0))
    : ICP.fromE8s((await anonymizeAmount(icp.toE8s())) as bigint);

export const anonymizeBallot = async (
  ballot: Ballot | undefined | null
): Promise<{ [key in keyof Required<Ballot>]: unknown } | undefined | null> => {
  if (ballot === undefined || ballot === null) {
    return ballot;
  }

  const { neuronId, vote, votingPower } = ballot;

  return {
    neuronId: await cutAndAnonymize(neuronId),
    vote,
    votingPower: await anonymizeAmount(votingPower),
  };
};

export const anonymizeFollowees = async (
  followees: Followees | undefined | null
): Promise<
  { [key in keyof Required<Followees>]: unknown } | undefined | null
> => {
  if (followees === undefined || followees === null) {
    return followees;
  }

  const { topic, followees: originalFollowees } = followees;

  return {
    topic,
    followees: await mapPromises(originalFollowees, anonymize),
  };
};

export const anonymizeAccount = async (
  account: Account | undefined | null
): Promise<
  { [key in keyof Required<Account>]: unknown } | undefined | null
> => {
  if (account === undefined || account === null) {
    return account;
  }

  const { identifier, principal, balance, name, type, subAccount } = account;

  return {
    identifier: await cutAndAnonymize(identifier),
    principal: anonymiseAvailability(principal),
    balance: await anonymizeICP(balance),
    name: name,
    type: type,
    subAccount: await cutAndAnonymize(subAccount?.join("")),
  };
};

export const anonymizeNeuronInfo = async (
  neuron: NeuronInfo | undefined
): Promise<undefined | { [key in keyof Required<NeuronInfo>]: unknown }> => {
  if (neuron === undefined || neuron === null) {
    return neuron;
  }

  const {
    neuronId,
    dissolveDelaySeconds,
    recentBallots,
    createdTimestampSeconds,
    state,
    joinedCommunityFundTimestampSeconds,
    retrievedAtTimestampSeconds,
    votingPower,
    ageSeconds,
    fullNeuron,
  } = neuron;

  return {
    neuronId: await cutAndAnonymize(neuronId),
    dissolveDelaySeconds,
    recentBallots,
    createdTimestampSeconds,
    state,
    joinedCommunityFundTimestampSeconds,
    retrievedAtTimestampSeconds,
    votingPower: await anonymizeAmount(votingPower),
    ageSeconds,
    fullNeuron: await anonymizeFullNeuron(fullNeuron),
  };
};

export const anonymizeFullNeuron = async (
  neuron: Neuron | undefined
): Promise<undefined | { [key in keyof Required<Neuron>]: unknown }> => {
  if (neuron === undefined || neuron === null) {
    return neuron;
  }

  const {
    id,
    controller,
    recentBallots,
    kycVerified,
    notForProfit,
    cachedNeuronStake,
    createdTimestampSeconds,
    maturityE8sEquivalent,
    agingSinceTimestampSeconds,
    neuronFees,
    hotKeys,
    accountIdentifier,
    joinedCommunityFundTimestampSeconds,
    dissolveState,
    followees,
    spawnAtTimesSeconds,
  } = neuron;

  return {
    id: await cutAndAnonymize(id),
    // principal string
    controller: anonymiseAvailability(controller),
    recentBallots,
    kycVerified: kycVerified,
    notForProfit,
    cachedNeuronStake: await anonymizeAmount(cachedNeuronStake),
    createdTimestampSeconds,
    maturityE8sEquivalent,
    agingSinceTimestampSeconds,
    neuronFees,
    // principal string[]
    hotKeys: hotKeys?.length,
    accountIdentifier: await cutAndAnonymize(accountIdentifier),
    joinedCommunityFundTimestampSeconds,
    spawnAtTimesSeconds,
    dissolveState,
    followees: await mapPromises(followees, anonymizeFollowees),
  };
};

export const anonymizeKnownNeuron = async (
  neuron: KnownNeuron | undefined
): Promise<undefined | { [key in keyof Required<KnownNeuron>]: unknown }> => {
  if (neuron === undefined || neuron === null) {
    return neuron;
  }

  const { id, name, description } = neuron;

  return {
    id: await cutAndAnonymize(id),
    name,
    description,
  };
};

export const anonymizeCanister = async (
  canister: CanisterDetails | undefined
): Promise<
  undefined | { [key in keyof Required<CanisterDetails>]: unknown }
> => {
  if (isNullish(canister)) {
    return canister;
  }

  const { name, canister_id } = canister;

  return {
    name,
    // TODO: what to do with principals
    // canister_id: await anonymize(canister_id),
    canister_id: anonymiseAvailability(canister_id),
  };
};

export const anonymizeTransaction = async ({
  transaction,
  account,
}: {
  transaction: Transaction | undefined;
  account: Account | undefined;
}): Promise<
  undefined | { [key in keyof Required<Transaction>]: unknown } | "no account"
> => {
  if (isNullish(transaction)) {
    return transaction;
  }

  if (account === undefined) {
    return "no account";
  }

  const { transaction_type, memo, timestamp, block_height } = transaction;

  const { isReceive, isSend, type, from, to, displayAmount, date } =
    mapTransaction({ transaction, account });

  return {
    transaction_type,
    memo,
    timestamp,
    block_height,
    transfer: {
      isReceive,
      isSend,
      type,
      from: from !== undefined ? undefined : await cutAndAnonymize(from),
      to: to !== undefined ? undefined : await cutAndAnonymize(to),
      displayAmount: await anonymizeICP(displayAmount),
      date,
    },
  };
};

export const anonymizeProposal = async (
  originalProposal: ProposalInfo | undefined
): Promise<undefined | { [key in keyof Required<ProposalInfo>]: unknown }> => {
  if (originalProposal === undefined || originalProposal === null) {
    return originalProposal;
  }

  const { ballots } = originalProposal;

  return {
    ...originalProposal,
    ballots: await mapPromises(ballots, anonymizeBallot),
  };
};

const anonymizeBuyer = async ([buyer, state]) => [
  buyer,
  {
    ...state,
    amount_icp_e8s: (await anonymizeAmount(state.amount_icp_e8s)) ?? BigInt(0),
    amount_sns_e8s: (await anonymizeAmount(state.amount_sns_e8s)) ?? BigInt(0),
  },
];

type AnonymizedSnsSummary = {
  rootCanisterId?: string;
  swapCanisterId?: string;
  metadata: SnsSummaryMetadata;
  token: SnsTokenMetadata;
  swap: SnsSummarySwap;
  derived: SnsSwapDerivedState;
};

export const anonymizeSnsSummary = async (
  originalSummary: SnsSummary | undefined | null
): Promise<AnonymizedSnsSummary | undefined> => {
  if (originalSummary !== undefined && originalSummary !== null) {
    const anonymizedBuyers = await mapPromises(
      originalSummary?.swap.state.buyers,
      anonymizeBuyer
    );
    return {
      ...originalSummary,
      rootCanisterId: await anonymize(originalSummary.rootCanisterId),
      swapCanisterId: await anonymize(originalSummary.swapCanisterId),
      swap: {
        ...originalSummary.swap,
        state: {
          ...originalSummary.swap.state,
          buyers: anonymizedBuyers,
        } as SnsSwapState,
      },
      derived: {
        ...originalSummary.derived,
        buyer_total_icp_e8s:
          (await anonymizeAmount(
            originalSummary.derived.buyer_total_icp_e8s
          )) ?? BigInt(0),
      },
    };
  }
};

type AnonymizedSwapCommitment = {
  rootCanisterId?: string;
  myCommitment: SnsSwapBuyerState | undefined;
};

export const anonymizeSnsSwapCommitment = async (
  originalSwapCommitment: SnsSwapCommitment | undefined | null
): Promise<AnonymizedSwapCommitment | undefined> => {
  if (
    originalSwapCommitment !== undefined &&
    originalSwapCommitment !== null &&
    originalSwapCommitment.myCommitment !== undefined
  ) {
    return {
      rootCanisterId: await anonymize(originalSwapCommitment.rootCanisterId),
      myCommitment: {
        ...originalSwapCommitment.myCommitment,
        amount_sns_e8s:
          (await anonymizeAmount(
            originalSwapCommitment.myCommitment?.amount_sns_e8s
          )) ?? BigInt(0),
        amount_icp_e8s:
          (await anonymizeAmount(
            originalSwapCommitment.myCommitment?.amount_icp_e8s
          )) ?? BigInt(0),
      },
    };
  }
};
