import { createAgent } from "$lib/api/agent.api";
import { icrcTransfer } from "$lib/api/icrc-ledger.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import { isLedgerIdentityProxy } from "$lib/proxy/icp-ledger.services.proxy";
import type { IcpAccountIdentifierText } from "$lib/types/account";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import type { IcrcAccount, IcrcBlockIndex } from "@dfinity/ledger";
import type { BlockHeight } from "@dfinity/nns";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { ICPToken, type TokenAmount } from "@dfinity/utils";

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
}: {
  identity: Identity;
  to: string;
  amount: TokenAmount;
  fromSubAccount?: SubAccountArray | undefined;
  memo?: bigint;
  createdAt?: bigint;
}): Promise<BlockHeight> => {
  logWithTimestamp(`Sending icp call...`);
  const { canister } = await ledgerCanister({ identity });

  if (amount.token !== ICPToken) {
    throw new Error("Token should be ICP");
  }

  const response = await canister.transfer({
    to: AccountIdentifier.fromHex(to),
    amount: amount.toE8s(),
    fromSubAccount,
    memo,
    createdAt: createdAt ?? nowInBigIntNanoSeconds(),
  });
  logWithTimestamp(`Sending icp complete.`);
  return response;
};

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
export const sendIcpIcrc1 = async ({
  identity,
  to,
  amount,
  memo,
  fromSubAccount,
  createdAt,
}: {
  identity: Identity;
  to: IcrcAccount;
  amount: TokenAmount;
  memo?: Uint8Array;
  fromSubAccount?: SubAccountArray;
  createdAt?: bigint;
}): Promise<IcrcBlockIndex> => {
  if (amount.token !== ICPToken) {
    throw new Error("Token should be ICP");
  }

  return icrcTransfer({
    identity,
    to,
    amount: amount.toE8s(),
    memo,
    fromSubAccount,
    createdAt: createdAt ?? nowInBigIntNanoSeconds(),
    fee: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
    canisterId: LEDGER_CANISTER_ID,
  });
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
    hardwareWallet: await isLedgerIdentityProxy(identity),
  });

  logWithTimestamp(`LC complete.`);

  return {
    canister,
    agent,
  };
};
