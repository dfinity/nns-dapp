import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { GOVERNANCE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import type { UiTransaction } from "$lib/types/transaction";
import type { Identity } from "@dfinity/agent";
import {
  AccountIdentifier,
  SubAccount,
  type TransactionWithId,
} from "@dfinity/ledger-icp";
import type { NeuronInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  ICPToken,
  TokenAmountV2,
  arrayOfNumberToUint8Array,
  asciiStringToByteArray,
  nonNullish,
} from "@dfinity/utils";
import { sha256 } from "@noble/hashes/sha256";

function bigintToUint8Array(num: bigint): Uint8Array {
  const bytes = [];
  while (num > 0n) {
    bytes.push(Number(num & 0xffn));
    num >>= 8n;
  }
  if (bytes.length === 0) {
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

const buildNeuronStakeSubAccount = (
  nonce: Uint8Array,
  principal: Principal
): SubAccount => {
  return SubAccount.fromBytes(
    getNeuronStakeSubAccountBytes(nonce, principal)
  ) as SubAccount;
};

const getNeuronStakeSubAccountBytes = (
  nonce: Uint8Array,
  principal: Principal
): Uint8Array => {
  const padding = asciiStringToByteArray("neuron-stake");
  const shaObj = sha256.create();
  shaObj.update(
    arrayOfNumberToUint8Array([
      0x0c,
      ...padding,
      ...principal.toUint8Array(),
      ...nonce,
    ])
  );
  return shaObj.digest();
};

export const mapIcpTransactionsToUiTransactions = ({
  transactions,
  identity,
  neurons = [],
  swapCanisterAccounts,
}: {
  transactions: TransactionWithId[];
  identity: Identity | undefined | null;
  neurons?: NeuronInfo[];
  swapCanisterAccounts: Set<string>;
}): UiTransaction[] => {
  return transactions.map(({ id, transaction }) => {
    let headline = "test transaction";
    let amount = 200_000_000n;
    if (
      "Transfer" in transaction.operation &&
      nonNullish(identity) &&
      nonNullish(neurons)
    ) {
      const neuronAccounts = new Set(
        neurons
          .map(({ fullNeuron }) => fullNeuron?.accountIdentifier)
          .filter(Boolean)
      );
      if (neuronAccounts.has(transaction.operation.Transfer.to)) {
        headline = transaction.memo > 0n ? "Stake neuron" : "Top up neuron";
        amount = transaction.operation.Transfer.amount.e8s;
      } else if (swapCanisterAccounts.has(transaction.operation.Transfer.to)) {
        headline = "Swap";
        amount = transaction.operation.Transfer.amount.e8s;
      } else {
        if (transaction.memo > 0n) {
          if (transaction.memo === TOP_UP_CANISTER_MEMO) {
            headline = "Top-up canister";
            amount = transaction.operation.Transfer.amount.e8s;
          } else if (transaction.memo === CREATE_CANISTER_MEMO) {
            headline = "Create canister";
            amount = transaction.operation.Transfer.amount.e8s;
          } else {
            const caller = identity.getPrincipal();
            const memoUint8Array = bigintToUint8Array(transaction.memo);
            const neuronSubaccount = buildNeuronStakeSubAccount(
              memoUint8Array,
              caller
            );
            const accountIdentifier = AccountIdentifier.fromPrincipal({
              principal: GOVERNANCE_CANISTER_ID,
              subAccount: neuronSubaccount,
            });
            if (
              transaction.operation.Transfer.to === accountIdentifier.toHex()
            ) {
              headline = "Stake neuron";
              amount = transaction.operation.Transfer.amount.e8s;
            }
          }
        }
      }
    }
    return {
      // Used in forEach for consistent rendering.
      domKey: id.toString(),
      isIncoming: false,
      isPending: false,
      isFailed: false,
      isReimbursement: false,
      headline,
      otherParty: undefined,
      tokenAmount: TokenAmountV2.fromUlps({
        amount,
        token: ICPToken,
      }),
      timestamp: new Date(),
    };
  });
};
