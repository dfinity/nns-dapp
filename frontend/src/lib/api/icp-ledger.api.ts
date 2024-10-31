import { createAgent } from "$lib/api/agent.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import type { IcpAccountIdentifierText } from "$lib/types/account";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import type { BlockHeight } from "@dfinity/ledger-icp";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import type { IcrcAccount } from "@dfinity/ledger-icrc";
import type { TokenAmount } from "@dfinity/utils";
import { toNullable } from "@dfinity/utils";

/**
 * Transfer ICP between accounts.
 *
 * @param {Object} params
 * @param {Identity} params.identity user identity
 * @param {string} params.to send ICP to destination address - an account identifier
 * @param {ICP} params.amount the amount to be transferred in ICP
 * @param {number[] | undefined} params.fromSubAccount the optional subaccount that would be the source of the transaction
 * @param {bigint | undefined} params.createdAt the optional timestamp of the transaction. Used to avoid deduplication.
 */
export const sendICP = async ({
  identity,
  to,
  amount,
  fromSubAccount,
  memo,
  createdAt,
  fee,
}: {
  identity: Identity;
  to: string;
  amount: bigint;
  fromSubAccount?: SubAccountArray | undefined;
  memo?: bigint;
  createdAt?: bigint;
  fee: bigint;
}): Promise<[BlockHeight, number]> => {
  logWithTimestamp(`Sending icp calls...`);
  const { canister } = await ledgerCanister({ identity });
  const durations: string[] = [];

  let startTime = performance.now();
  const duration_in_minutes = 5;
  const duration_in_ms = duration_in_minutes * 60 * 1000;
  while (performance.now() - startTime < duration_in_ms) {
    try {
      let start = performance.now();
      const response = await canister.transfer({
        to: AccountIdentifier.fromHex(to),
        amount,
        fromSubAccount,
        memo,
        createdAt: createdAt ?? nowInBigIntNanoSeconds(),
        fee,
      });
      let end = performance.now();
      let duration_ms = end - start;
      // Collect the duration data
      durations.push(`${duration_ms}\n`);
      console.log(`${duration_ms}`);
    } catch (e) {
      console.error("Retrying after error");
      // console.error(e);
    }
  }

  const now = new Date();
  // Format the date and time as 'YYYY-MM-DD_HH-MM-SS'
  const formattedDateTime = now
    .toISOString()
    .replace(/:\s*/g, "-")
    .replace("T", "_")
    .split(".")[0];
  // Append the formatted date and time to the filename
  const filename = `${formattedDateTime}.txt`;

  // Convert the durations array to a Blob
  const blob = new Blob(durations, { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  // Create an anchor element and trigger a download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Required for Firefox
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();

  let start = Date.now();
  const response = await canister.transfer({
    to: AccountIdentifier.fromHex(to),
    amount,
    fromSubAccount,
    memo,
    createdAt: createdAt ?? nowInBigIntNanoSeconds(),
    fee,
  });
  let end = Date.now();
  let duration_ms = end - start;

  console.log(`Time taken to await canister.transfer: ${end - start}ms`);
  logWithTimestamp(`Sending icp complete.`);
  return [response, duration_ms];
};

// WARNING: When using the ICRC-1 interface of the ICP ledger canister, there is
// no relationship between the memo and the icrc1Memo of a transaction. The
// ICRC-1 interface simply cannot set the memo field and the non-ICRC-1
// interface cannot set the icrc1Memo field, even though the icrc1Memo field is
// called just "memo" in canister method params.
/**
 * Transfer ICP between accounts.
 *
 * @param {Object} params
 * @param {Identity} params.identity user identity
 * @param {IcrcAccount} params.to destination account
 * @param {TokenAmount} params.amount the amount to be transferred in ICP
 * @param {bigint | undefined} params.fee the transaction fee in E8s
 * @param {Uint8Array | undefined} params.fromSubAccount the optional subaccount that would be the source of the transaction
 * @param {bigint | undefined} params.createdAt the optional timestamp of the transaction. Used to avoid deduplication.
 */
export const sendIcpIcrc1 = async ({
  identity,
  to,
  amount,
  fee,
  icrc1Memo,
  fromSubAccount,
  createdAt,
}: {
  identity: Identity;
  to: IcrcAccount;
  amount: TokenAmount;
  fee?: bigint;
  icrc1Memo?: Uint8Array;
  fromSubAccount?: Uint8Array;
  createdAt?: bigint;
}): Promise<BlockHeight> => {
  logWithTimestamp(`Sending ICRC-1 icp call...`);
  const { canister } = await ledgerCanister({ identity });

  const response = await canister.icrc1Transfer({
    to: {
      owner: to.owner,
      subaccount: toNullable(to.subaccount),
    },
    amount: amount.toE8s(),
    fee,
    fromSubAccount,
    icrc1Memo,
    createdAt: createdAt ?? nowInBigIntNanoSeconds(),
  });
  logWithTimestamp(`Sending ICRC-1 icp complete.`);
  return response;
};

/**
 * Returns transaction fee of the Ledger Canister in IC
 *
 * @param {Object} params
 * @param {Identity} params.identity user identity
 *
 * @returns {bigint}
 */
export const transactionFee = async ({
  identity,
}: {
  identity: Identity;
}): Promise<bigint> => {
  logWithTimestamp(`Getting transaction fee call...`);
  const { canister } = await ledgerCanister({ identity });
  const fee = await canister.transactionFee();
  logWithTimestamp(`Getting transaction fee complete.`);
  return fee;
};

/**
 * TODO(GIX-1704): fetch accounts' balances with ICRC
 * @deprecated
 */
export const queryAccountBalance = async ({
  icpAccountIdentifier,
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
  icpAccountIdentifier: IcpAccountIdentifierText;
}) => {
  logWithTimestamp(`Get account balance call...`);
  const { canister } = await ledgerCanister({ identity });

  const e8sBalance = await canister.accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(icpAccountIdentifier),
    certified,
  });

  logWithTimestamp(`Get account balance complete`);
  return e8sBalance;
};

export const ledgerCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: LedgerCanister;
  agent: Agent;
}> => {
  logWithTimestamp(`LC call...`);
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  logWithTimestamp(`LC complete.`);

  return {
    canister,
    agent,
  };
};
