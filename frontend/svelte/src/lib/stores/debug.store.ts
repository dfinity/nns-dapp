import {
  ICP,
  type BallotInfo,
  type Followees,
  type KnownNeuron,
  type Neuron,
  type NeuronInfo,
  type ProposalInfo,
} from "@dfinity/nns";
import { derived, get, type Readable, type Writable } from "svelte/store";
import type {
  CanisterDetails,
  Transaction,
} from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";
import type { AddAccountStore } from "../types/add-account.context";
import type { HardwareWalletNeuronsStore } from "../types/hardware-wallet-neurons.context";
import type { SelectedAccountStore } from "../types/selected-account.context";
import type { TransactionStore } from "../types/transaction.context";
import { digestText } from "../utils/dev.utils";
import { mapTransaction } from "../utils/transactions.utils";
import { stringifyJson } from "../utils/utils";
import { accountsStore } from "./accounts.store";
import { canistersStore } from "./canisters.store";
import { knownNeuronsStore } from "./knownNeurons.store";
import { sortedNeuronStore } from "./neurons.store";
import {
  proposalIdStore,
  proposalInfoStore,
  proposalsFiltersStore,
  proposalsStore,
  votingNeuronSelectStore,
} from "./proposals.store";
import { routeStore } from "./route.store";
import { toastsStore } from "./toasts.store";

const isSet = (value: unknown): boolean =>
  value === undefined || value === null;

const anonymize = async (value: unknown): Promise<string | undefined> =>
  value === undefined ? undefined : digestText(`${value}`);

const anonymizeAmount = async (
  amount: bigint | undefined
): Promise<bigint | undefined> =>
  amount === undefined
    ? undefined
    : BigInt(parseInt((await anonymize(amount)) as string, 36));

const anonymizeICP = async (icp: ICP | undefined): Promise<ICP | undefined> =>
  icp === undefined
    ? undefined
    : icp.toE8s() === BigInt(0)
    ? ICP.fromE8s(BigInt(0))
    : ICP.fromE8s((await anonymizeAmount(icp.toE8s())) as bigint);

const anonymizeBallot = async (
  ballot: BallotInfo | undefined | null
): Promise<
  { [key in keyof Required<BallotInfo>]: unknown } | undefined | null
> => {
  if (ballot === undefined || ballot === null) {
    return ballot;
  }

  const { vote, proposalId } = ballot;

  return {
    vote,
    proposalId,
  };
};

const anonymizeFollowees = async (
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
    followees: originalFollowees?.map(async (id) => await anonymize(id)),
  };
};

const anonymizeAccount = async (
  account: Account | undefined | null
): Promise<
  { [key in keyof Required<Account>]: unknown } | undefined | null
> => {
  if (account === undefined || account === null) {
    return account;
  }

  const { identifier, principal, balance, name, type, subAccount } = account;

  return {
    identifier: anonymize(identifier),
    principal: isSet(principal) ? "yes" : "no",
    balance: anonymizeICP(balance),
    name: name,
    type: type,
    subAccount: subAccount?.map(async (id) => await anonymize(id)),
  };
};

const anonymizeNeuronInfo = async (
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
    neuronId: await anonymize(neuronId),
    dissolveDelaySeconds,
    recentBallots: recentBallots?.map(
      async (ballot) => await anonymizeBallot(ballot)
    ),
    createdTimestampSeconds,
    state,
    joinedCommunityFundTimestampSeconds,
    retrievedAtTimestampSeconds,
    votingPower: anonymizeAmount(votingPower),
    ageSeconds,
    fullNeuron: anonymizeFullNeuron(fullNeuron),
  };
};

const anonymizeFullNeuron = async (
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
  } = neuron;

  return {
    id: await anonymize(id),
    // principal string
    controller: isSet(controller) ? "yes" : "no",
    recentBallots: recentBallots?.map(
      async (ballot) => await anonymizeBallot(ballot)
    ),
    kycVerified: kycVerified,
    notForProfit,
    cachedNeuronStake: anonymizeAmount(cachedNeuronStake),
    createdTimestampSeconds,
    maturityE8sEquivalent,
    agingSinceTimestampSeconds,
    neuronFees,
    // principal string[]
    hotKeys: hotKeys?.length,
    accountIdentifier: await anonymize(accountIdentifier),
    joinedCommunityFundTimestampSeconds,
    dissolveState,
    followees: followees?.map(async (item) => await anonymizeFollowees(item)),
  };
};

const anonymizeKnownNeuron = async (
  neuron: KnownNeuron | undefined
): Promise<undefined | { [key in keyof Required<KnownNeuron>]: unknown }> => {
  if (neuron === undefined || neuron === null) {
    return neuron;
  }

  const { id, name, description } = neuron;

  return {
    id: await anonymize(id),
    name,
    description,
  };
};

const anonymizeCanister = async (
  canister: CanisterDetails | undefined
): Promise<
  undefined | { [key in keyof Required<CanisterDetails>]: unknown }
> => {
  if (canister === undefined || canister === null) {
    return canister;
  }

  const { name, canister_id } = canister;

  return {
    name,
    // TODO: what to do with principals
    // canister_id: await anonymize(canister_id),
    canister_id: isSet(canister_id) ? "yes" : "no",
  };
};

const anonymizeTransaction = async ({
  transaction,
  account,
}: {
  transaction: Transaction | undefined;
  account: Account | undefined;
}): Promise<
  undefined | { [key in keyof Required<Transaction>]: unknown } | "no account"
> => {
  if (transaction === undefined || transaction === null) {
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
      from: from !== undefined ? undefined : await anonymize(from),
      to: to !== undefined ? undefined : await anonymize(to),
      displayAmount: await anonymizeICP(displayAmount),
      date,
    },
  };
};

const anonymizeProposal = async (
  originalProposal: ProposalInfo | undefined
): Promise<undefined | { [key in keyof Required<ProposalInfo>]: unknown }> => {
  if (originalProposal === undefined || originalProposal === null) {
    return originalProposal;
  }

  const {
    id,
    ballots,
    rejectCost,
    proposalTimestampSeconds,
    rewardEventRound,
    failedTimestampSeconds,
    decidedTimestampSeconds,
    latestTally,
    proposal,
    proposer,
    executedTimestampSeconds,
    topic,
    status,
    rewardStatus,
  } = originalProposal;

  return {
    id,
    ballots,
    rejectCost,
    proposalTimestampSeconds,
    rewardEventRound,
    failedTimestampSeconds,
    decidedTimestampSeconds,
    latestTally,
    proposal,
    proposer,
    executedTimestampSeconds,
    topic,
    status,
    rewardStatus,
  };
};

const createDerivedStore = <T>(store: Writable<T>): Readable<T> =>
  derived(store, (store) => store);

let addAccountStore: Readable<AddAccountStore>;
export const debugAddAccountStore = (store: Writable<AddAccountStore>) =>
  (addAccountStore = createDerivedStore(store));

let hardwareWalletNeuronsStore: Readable<HardwareWalletNeuronsStore>;
export const debugHardwareWalletNeuronsStore = (
  store: Writable<HardwareWalletNeuronsStore>
) => (hardwareWalletNeuronsStore = createDerivedStore(store));

let transactionStore: Readable<TransactionStore>;
export const debugTransactionStore = (store: Writable<TransactionStore>) =>
  (transactionStore = createDerivedStore(store));

let selectedAccountStore: Readable<SelectedAccountStore>;
export const debugSelectedAccountStore = (
  store: Writable<SelectedAccountStore>
) => (selectedAccountStore = createDerivedStore(store));

const initDebugStore = () =>
  derived(
    [
      routeStore,
      accountsStore,
      sortedNeuronStore,
      knownNeuronsStore,
      canistersStore,
      proposalsStore,
      proposalsFiltersStore,
      proposalIdStore,
      proposalInfoStore,
      votingNeuronSelectStore,
      toastsStore,
      addAccountStore,
      hardwareWalletNeuronsStore,
      transactionStore,
      selectedAccountStore,
    ],
    ([
      $routeStore,
      $accountsStore,
      $sortedNeuronStore,
      $knownNeuronsStore,
      $canistersStore,
      $proposalsStore,
      $proposalsFiltersStore,
      $proposalIdStore,
      $proposalInfoStore,
      $votingNeuronSelectStore,
      $toastsStore,
      $addAccountStore,
      $hardwareWalletNeuronsStore,
      $transactionStore,
      $selectedAccountStore,
    ]) => ({
      route: $routeStore,
      accounts: $accountsStore,
      sortedNeuron: $sortedNeuronStore,
      knownNeurons: $knownNeuronsStore,
      canisters: $canistersStore,
      proposals: $proposalsStore,
      proposalsFilters: $proposalsFiltersStore,
      proposalId: $proposalIdStore,
      proposalInfo: $proposalInfoStore,
      votingNeuronSelect: $votingNeuronSelectStore,
      toasts: $toastsStore,
      addAccount: $addAccountStore,
      hardwareWalletNeurons: $hardwareWalletNeuronsStore,
      transaction: $transactionStore,
      selectedAccount: $selectedAccountStore,
    })
  );

globalThis._log = async () => {
  const debugStore = initDebugStore();
  const {
    route,
    accounts,
    sortedNeuron,
    knownNeurons,
    canisters,
    proposals,
    proposalsFilters,
    proposalId,
    proposalInfo,
    votingNeuronSelect,
    toasts,
    addAccount,
    hardwareWalletNeurons,
    transaction,
    selectedAccount,
  } = get(debugStore);

  const anonymizedState = {
    route: route,
    accounts: {
      main: await anonymizeAccount(accounts?.main),
      subAccounts: accounts?.subAccounts?.map(
        async (account) => await anonymizeAccount(account)
      ),
      hardwareWallets: accounts?.hardwareWallets?.map(
        async (account) => await anonymizeAccount(account)
      ),
    },
    sortedNeuron: sortedNeuron?.map(
      async (neuron) => await anonymizeNeuronInfo(neuron)
    ),
    knownNeurons: knownNeurons?.map(
      async (neuron) => await anonymizeKnownNeuron(neuron)
    ),
    canisters: canisters?.map(
      async (canister) => await anonymizeCanister(canister)
    ),
    proposals: {
      proposals: proposals?.proposals?.map(
        async (proposal) => await anonymizeProposal(proposal)
      ),
      certified: proposals?.certified,
    },
    proposalsFilters: proposalsFilters,
    proposalId: proposalId,
    proposalInfo: proposalInfo,
    votingNeuronSelect: {
      neurons: votingNeuronSelect?.neurons?.map(
        async (neuron) => await anonymizeNeuronInfo(neuron)
      ),
      selectedIds: votingNeuronSelect?.selectedIds?.map(
        async (id) => await anonymize(id)
      ),
    },
    toasts: toasts,
    addAccount: {
      type: addAccount?.type,
      hardwareWalletName: addAccount?.hardwareWalletName,
    },
    hardwareWalletNeurons,
    transaction: {
      selectedAccount: await anonymizeAccount(transaction?.selectedAccount),
      destinationAddress: await anonymize(transaction?.destinationAddress),
      amount: await anonymizeICP(transaction?.amount),
    },
    selectedAccount: {
      account: await anonymizeAccount(selectedAccount?.account),
      transactions: selectedAccount?.transactions?.map(
        async (transaction) =>
          await anonymizeTransaction({
            transaction,
            account: selectedAccount?.account,
          })
      ),
    },
  };

  const anonymizedStateAsText = stringifyJson(anonymizedState, {
    indentation: 2,
  });
  console.log(anonymizedStateAsText);
  saveToFile(anonymizedStateAsText);
};

const saveToFile = (content: string): void => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = "nns-local-state.json";
  a.click();
};
