import type {
  CanisterDetails,
  Transaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { IcrcTransactions } from "$lib/stores/icrc-transactions.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { VotingNeuron } from "$lib/types/proposals";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import type { IcrcTransaction } from "@dfinity/ledger";
import {
  TokenAmount,
  type Ballot,
  type Followees,
  type KnownNeuron,
  type Neuron,
  type NeuronInfo,
  type ProposalInfo,
} from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsNeuron,
  SnsSwapBuyerState,
  SnsSwapDerivedState,
  SnsTransferableAmount,
} from "@dfinity/sns";
import { fromNullable, isNullish, nonNullish } from "@dfinity/utils";
import { digestText } from "./dev.utils";
import {
  getSnsNeuronIdAsHexString,
  subaccountToHexString,
} from "./sns-neuron.utils";
import { mapNnsTransaction } from "./transactions.utils";
import { mapPromises } from "./utils";

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
  tokens: TokenAmount | undefined
): Promise<TokenAmount | undefined> =>
  tokens === undefined
    ? undefined
    : tokens.toE8s() === BigInt(0)
    ? TokenAmount.fromE8s({ amount: BigInt(0), token: tokens.token })
    : TokenAmount.fromE8s({
        amount: (await anonymizeAmount(tokens.toE8s())) as bigint,
        token: tokens.token,
      });

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
    return account as undefined | null;
  }

  const { identifier, principal, balanceE8s, name, type, subAccount } = account;

  return {
    identifier: await cutAndAnonymize(identifier),
    principal: anonymiseAvailability(principal),
    balanceE8s,
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

export const anonymizeVotingNeuron = async (
  neuron: VotingNeuron | undefined
): Promise<undefined | { [key in keyof Required<VotingNeuron>]: unknown }> => {
  if (neuron === undefined || neuron === null) {
    return neuron;
  }

  const { neuronIdString, votingPower } = neuron;

  return {
    neuronIdString: await cutAndAnonymize(neuronIdString),
    votingPower: await anonymizeAmount(votingPower),
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
    stakedMaturityE8sEquivalent,
    controller,
    recentBallots,
    kycVerified,
    notForProfit,
    cachedNeuronStake,
    createdTimestampSeconds,
    autoStakeMaturity,
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
    stakedMaturityE8sEquivalent,
    // principal string
    controller: anonymiseAvailability(controller),
    recentBallots,
    kycVerified: kycVerified,
    notForProfit,
    cachedNeuronStake: await anonymizeAmount(cachedNeuronStake),
    createdTimestampSeconds,
    autoStakeMaturity,
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

export const anonymizeSnsNeuron = async (
  snsNeuron: SnsNeuron | undefined | null
): Promise<{ [key in keyof Required<SnsNeuron>]: unknown } | undefined> => {
  if (isNullish(snsNeuron)) {
    return undefined;
  }
  const {
    staked_maturity_e8s_equivalent,
    permissions,
    maturity_e8s_equivalent,
    cached_neuron_stake_e8s,
    created_timestamp_seconds,
    source_nns_neuron_id,
    auto_stake_maturity,
    aging_since_timestamp_seconds,
    dissolve_state,
    voting_power_percentage_multiplier,
    followees,
    neuron_fees_e8s,
    vesting_period_seconds,
    disburse_maturity_in_progress,
  } = snsNeuron;

  return {
    id: getSnsNeuronIdAsHexString(snsNeuron),
    staked_maturity_e8s_equivalent,
    permissions: await mapPromises(
      permissions,
      async ({ principal, permission_type }) => ({
        principal: await anonymize(principal[0]),
        permission_type,
      })
    ),
    cached_neuron_stake_e8s,
    maturity_e8s_equivalent,
    created_timestamp_seconds,
    source_nns_neuron_id: await cutAndAnonymize(source_nns_neuron_id[0]),
    auto_stake_maturity,
    aging_since_timestamp_seconds,
    dissolve_state,
    voting_power_percentage_multiplier,
    followees: followees.map(([functionId, followees]) => [
      functionId,
      followees.followees.map(({ id }) => subaccountToHexString(id)),
    ]),
    neuron_fees_e8s,
    vesting_period_seconds,
    disburse_maturity_in_progress,
  };
};

type SnsAccountRaw = {
  owner: Principal;
  subaccount: [] | [Uint8Array];
};
const anonymizeSnsAccount = async (
  account: SnsAccountRaw | undefined
): Promise<{ [key in keyof SnsAccountRaw]: unknown } | undefined> => {
  if (isNullish(account)) {
    return undefined;
  }
  const { owner, subaccount } = account;
  return {
    owner: anonymiseAvailability(owner),
    subaccount: subaccount.map(subaccountToHexString),
  };
};

// Type Union of Burn, Mint and Transfer. We don't have individual types for these yet so we use this.
type Transfer = {
  to?: SnsAccountRaw;
  fee?: [] | [bigint];
  from?: SnsAccountRaw;
  memo: [] | [Uint8Array];
  created_at_time: [] | [bigint];
  amount: bigint;
};
type TransferOpt = [] | [Transfer];
const anonymizeTransfer = async (
  transfer: TransferOpt
): Promise<{ [key in keyof Transfer]: unknown } | undefined> => {
  const data = fromNullable(transfer);
  if (isNullish(data)) {
    return undefined;
  }
  return {
    to: await anonymizeSnsAccount(data.to),
    from: await anonymizeSnsAccount(data.from),
    fee: data.fee,
    memo: data.memo,
    created_at_time: data.created_at_time,
    amount: await anonymizeAmount(data.amount),
  };
};

const anonymizeSnsTransaction = async (
  tx: IcrcTransaction
): Promise<{ [key in keyof Required<IcrcTransaction>]: unknown }> => {
  return {
    timestamp: tx.timestamp,
    kind: tx.kind,
    burn: await anonymizeTransfer(tx.burn as TransferOpt),
    mint: await anonymizeTransfer(tx.mint as TransferOpt),
    transfer: await anonymizeTransfer(tx.transfer as TransferOpt),
  };
};

export const anonymizeTransactionStore = async (
  store: IcrcTransactions
): Promise<
  undefined | { [key in keyof Required<IcrcTransactions>]: unknown }
> => {
  const anonymizedStore: SnsTypeStore<unknown> = {};
  for (const [key, value] of Object.entries(store)) {
    anonymizedStore[key] = {
      completed: value.completed,
      oldestTxId: value.oldestTxId,
      transactions: await mapPromises(
        value.transactions,
        async ({ id, transaction }) => ({
          id,
          transaction: await anonymizeSnsTransaction(transaction),
        })
      ),
    };
  }
  return anonymizedStore;
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
    mapNnsTransaction({
      transaction,
      account,
    });

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
      displayAmount,
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

const anonymizeBuyer = async ([buyer, state]: [
  string,
  SnsSwapBuyerState
]): Promise<[string, SnsSwapBuyerState]> => [
  buyer,
  {
    icp: [
      {
        ...state.icp[0],
        amount_e8s:
          (await anonymizeAmount(state.icp[0]?.amount_e8s)) ?? BigInt(0),
      } as SnsTransferableAmount,
    ],
  },
];

type AnonymizedSnsSummary = {
  rootCanisterId?: string;
  swapCanisterId?: string;
  metadata: SnsSummaryMetadata;
  token: IcrcTokenMetadata;
  swap: SnsSummarySwap;
  derived: SnsSwapDerivedState;
};

export const anonymizeSnsSummary = async (
  originalSummary: SnsSummary | undefined | null
): Promise<AnonymizedSnsSummary | undefined> => {
  if (originalSummary !== undefined && originalSummary !== null) {
    const anonymizedBuyers = await mapPromises(
      originalSummary?.swap.buyers,
      anonymizeBuyer
    );
    return {
      ...originalSummary,
      rootCanisterId: await anonymize(originalSummary.rootCanisterId),
      swapCanisterId: await anonymize(originalSummary.swapCanisterId),
      swap: {
        ...originalSummary.swap,
        buyers: anonymizedBuyers ?? [],
      },
      derived: {
        ...originalSummary.derived,
        buyer_total_icp_e8s: (await anonymizeAmount(
          originalSummary.derived.buyer_total_icp_e8s
        )) as bigint,
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
    const commitment = originalSwapCommitment.myCommitment.icp[0];
    return {
      rootCanisterId: await anonymize(originalSwapCommitment.rootCanisterId),
      myCommitment: {
        icp:
          commitment !== undefined
            ? [
                {
                  ...commitment,
                  amount_e8s: (await anonymizeAmount(
                    commitment.amount_e8s
                  )) as bigint,
                },
              ]
            : [],
      },
    };
  }
};

interface SnsTypeStore<T> {
  [key: string]: T;
}
export const anonymizeSnsTypeStore = async <T>(
  store: SnsTypeStore<T>,
  transformFn: (s: T) => unknown
) => {
  const anonymizedStore: SnsTypeStore<unknown> = {};
  for (const [key, value] of Object.entries(store)) {
    anonymizedStore[key] = await transformFn(value);
  }
  return anonymizedStore;
};
