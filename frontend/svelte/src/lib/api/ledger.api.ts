import type { HttpAgent, Identity } from "@dfinity/agent";
import type { BlockHeight } from "@dfinity/nns";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { isLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";

/**
 * Transfer ICP between accounts.
 *
 * @param {Object} params
 * @param {Identity} params.identity user identity
 * @param {string} params.to send ICP to destination address - an account identifier
 * @param {ICP} params.amount the amount to be transferred in ICP
 * @param {number[] | undefined} params.fromSubAccount the optional subaccount that would be the source of the transaction
 */
export const sendICP = async ({
  identity,
  to,
  amount,
  fromSubAccount,
  memo,
}: {
  identity: Identity;
  to: string;
  amount: ICP;
  fromSubAccount?: SubAccountArray | undefined;
  memo?: bigint;
}): Promise<BlockHeight> => {
  logWithTimestamp(`Sending icp call...`);
  const { canister } = await ledgerCanister({ identity });

  const response = await canister.transfer({
    to: AccountIdentifier.fromHex(to),
    amount,
    fromSubAccount,
    memo,
  });
  logWithTimestamp(`Sending icp complete.`);
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
export const transactionFee = async ({ identity }: { identity: Identity }): Promise<bigint> => {
  logWithTimestamp(`Getting transaction fee call...`);
  const { canister } = await ledgerCanister({ identity });
  const fee = await canister.transactionFee();
  logWithTimestamp(`Getting transactoin fee complete.`);
  return fee;
};

export const ledgerCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: LedgerCanister;
  agent: HttpAgent;
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
