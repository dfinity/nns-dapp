import {
  ICP,
  type Ballot,
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

const applyMap = async (
  items: Array<unknown> | undefined,
  fun: (args: unknown) => Promise<unknown>
): Promise<unknown> => {
  if (items === undefined) {
    return undefined;
  }

  return Promise.all(items.map(async (item) => await fun(item)));
};

const anonymize = async (value: unknown): Promise<string | undefined> =>
  value === undefined ? undefined : digestText(`${value}`);

const anonymizeAmount = async (
  amount: bigint | undefined
): Promise<bigint | undefined> =>
  amount === undefined
    ? undefined
    : BigInt(((await anonymize(amount)) as string).replace(/[A-z]/g, ""));

const anonymizeICP = async (icp: ICP | undefined): Promise<ICP | undefined> =>
  icp === undefined
    ? undefined
    : icp.toE8s() === BigInt(0)
    ? ICP.fromE8s(BigInt(0))
    : ICP.fromE8s((await anonymizeAmount(icp.toE8s())) as bigint);

const anonymizeRecentBallot = async (
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
const anonymizeBallot = async (
  ballot: Ballot | undefined | null
): Promise<{ [key in keyof Required<Ballot>]: unknown } | undefined | null> => {
  if (ballot === undefined || ballot === null) {
    return ballot;
  }

  const { neuronId, vote, votingPower } = ballot;

  return {
    neuronId: await anonymize(neuronId),
    vote,
    votingPower: await anonymizeAmount(votingPower),
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
    followees: await applyMap(originalFollowees, anonymize),
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
    identifier: await anonymize(identifier),
    principal: isSet(principal) ? "yes" : "no",
    balance: await anonymizeICP(balance),
    name: name,
    type: type,
    subAccount: await anonymize(subAccount?.join("")),
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
    recentBallots: await applyMap(recentBallots, anonymizeRecentBallot),
    createdTimestampSeconds,
    state,
    joinedCommunityFundTimestampSeconds,
    retrievedAtTimestampSeconds,
    votingPower: await anonymizeAmount(votingPower),
    ageSeconds,
    fullNeuron: await anonymizeFullNeuron(fullNeuron),
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
    recentBallots: await applyMap(recentBallots, anonymizeRecentBallot),
    kycVerified: kycVerified,
    notForProfit,
    cachedNeuronStake: await anonymizeAmount(cachedNeuronStake),
    createdTimestampSeconds,
    maturityE8sEquivalent,
    agingSinceTimestampSeconds,
    neuronFees,
    // principal string[]
    hotKeys: hotKeys?.length,
    accountIdentifier: await anonymize(accountIdentifier),
    joinedCommunityFundTimestampSeconds,
    dissolveState,
    followees: await applyMap(followees, anonymizeFollowees),
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
    ballots: await applyMap(ballots, anonymizeBallot),
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

/**
 * Collects state of all available stores (also from context)
 */
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

/**
 * 1. generates anonymized version of stores state
 * 2. log it in the dev console
 * 3. generates a json file with logged context
 */
const logStoreState = async () => {
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
      subAccounts: await applyMap(accounts?.subAccounts, anonymizeAccount),
      hardwareWallets: await applyMap(
        accounts?.hardwareWallets,
        anonymizeAccount
      ),
    },
    sortedNeuron: await applyMap(sortedNeuron, anonymizeNeuronInfo),
    knownNeurons: await applyMap(knownNeurons, anonymizeKnownNeuron),
    canisters: await applyMap(canisters, anonymizeCanister),
    proposals: {
      proposals: await applyMap(proposals?.proposals, anonymizeProposal),
      certified: proposals?.certified,
    },
    proposalsFilters: proposalsFilters,
    proposalId: proposalId,
    proposalInfo: proposalInfo,
    votingNeuronSelect: {
      neurons: await applyMap(votingNeuronSelect?.neurons, anonymizeNeuronInfo),
      selectedIds: await applyMap(votingNeuronSelect?.selectedIds, anonymize),
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
      transactions: await applyMap(
        selectedAccount?.transactions,
        (transaction: Transaction) =>
          anonymizeTransaction({
            transaction,
            account: selectedAccount?.account,
          })
      ),
    },
  };

  const date = new Date().toJSON().split(".")[0].replace(/:/g, "-");
  const anonymizedStateAsText = stringifyJson(anonymizedState, {
    indentation: 2,
  });
  console.log(date, anonymizedStateAsText);
  saveToFile(anonymizedStateAsText, `${date}_nns-local-state.json`);
};

const saveToFile = (content: string, fileName: string): void => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

/**
 * To not have it in the string form in the code
 * @returns "nns-state"
 */
const TRIGGER_PHRASE = [101, 116, 97, 116, 115, 45, 115, 110, 110]
  .reverse()
  .map((c) => String.fromCharCode(c))
  .join("");

/**
 * Add console.log with a version that logs the stores on TRIGGER_PHRASE
 */
(() => {
  const originalLog = console.log;
  console.log = function (...args) {
    if (args.length === 1 && args[0] === TRIGGER_PHRASE) {
      logStoreState();
    } else {
      originalLog.apply(this, args);
    }
  };
})();
