import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, SubAccount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { CMCCanister } from "../canisters/cmc/cmc.canister";
import { principalToSubAccount } from "../canisters/cmc/utils";
import { ICManagementCanister } from "../canisters/ic-management/ic-management.canister";
import type { CanisterDetails } from "../canisters/ic-management/ic-management.canister.types";
import type { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";
import { CYCLES_MINTING_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { CREATE_CANISTER_MEMO, TOP_UP_CANISTER_MEMO } from "./constants.api";
import { sendICP } from "./ledger.api";
import { nnsDappCanister } from "./nns-dapp.api";

export const queryCanisters = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<CanisterInfo[]> => {
  logWithTimestamp(`Querying Canisters certified:${certified} call...`);
  const { nnsDapp } = await canisters(identity);

  const response = await nnsDapp.getCanisters({ certified });

  logWithTimestamp(`Querying Canisters certified:${certified} complete.`);

  return response;
};

export const queryCanisterDetails = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<CanisterDetails> => {
  logWithTimestamp(`Getting canister ${canisterId.toText()} details call...`);
  const { icMgt } = await canisters(identity);

  const response = await icMgt.getCanisterDetails(canisterId);

  logWithTimestamp(`Getting canister ${canisterId.toText()} details complete.`);

  return response;
};

export const attachCanister = async ({
  identity,
  name,
  canisterId,
}: {
  identity: Identity;
  name?: string;
  canisterId: Principal;
}): Promise<void> => {
  logWithTimestamp("Attaching canister call...");
  const { nnsDapp } = await canisters(identity);

  await nnsDapp.attachCanister({
    name: name ?? "",
    canisterId,
  });

  logWithTimestamp("Attaching canister call complete.");
};

export const createCanister = async ({
  identity,
  amount,
  name,
}: {
  identity: Identity;
  amount: ICP;
  name?: string;
}): Promise<Principal> => {
  logWithTimestamp("Create canister call...");

  const { cmc, nnsDapp } = await canisters(identity);
  const principal = identity.getPrincipal();
  const toSubAccount = principalToSubAccount(principal);
  // To create a canister you need to send ICP to an account owned by the CMC, so that the CMC can burn those funds.
  // To ensure everyone uses a unique address, the intended controller of the new canister is used to calculate the subaccount.
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });

  // Transfer the funds
  const blockHeight = await sendICP({
    memo: CREATE_CANISTER_MEMO,
    identity,
    to: recipient.toHex(),
    amount,
  });

  // If this fails or the client loses connection
  // nns dapp backend polls the transactions
  // and will also notify to CMC the transaction if it's pending
  // TODO: https://dfinity.atlassian.net/browse/L2-591
  const canisterId = await cmc.notifyCreateCanister({
    controller: principal,
    block_index: blockHeight,
  });

  // Attach the canister to the user in the nns-dapp.
  // The same background tasks that notifies the CMC also attaches the canister.
  // `name` is mandatory and unique per user,
  // but it can be an empty string
  // TODO: https://dfinity.atlassian.net/browse/L2-591
  await nnsDapp.attachCanister({
    name: name ?? "",
    canisterId,
  });

  logWithTimestamp("Create canister complete.");

  return canisterId;
};

export const topUpCanister = async ({
  identity,
  canisterId,
  amount,
}: {
  identity: Identity;
  canisterId: Principal;
  amount: ICP;
}): Promise<void> => {
  logWithTimestamp(`Topping up canister ${canisterId.toText()} call...`);

  const { cmc } = await canisters(identity);
  const toSubAccount = principalToSubAccount(canisterId);
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });
  const blockHeight = await sendICP({
    memo: TOP_UP_CANISTER_MEMO,
    identity,
    amount,
    to: recipient.toHex(),
  });

  // If this fails or the client loses connection
  // nns dapp backend polls the transactions
  // and will also notify to CMC the transaction if it's pending
  // TODO: https://dfinity.atlassian.net/browse/L2-591
  await cmc.notifyTopUp({
    canister_id: canisterId,
    block_index: blockHeight,
  });

  logWithTimestamp(`Topping up canister ${canisterId.toText()} complete.`);
};

const canisters = async (
  identity: Identity
): Promise<{
  cmc: CMCCanister;
  icMgt: ICManagementCanister;
  nnsDapp: NNSDappCanister;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const cmc = CMCCanister.create({
    agent,
    canisterId: CYCLES_MINTING_CANISTER_ID,
  });

  const icMgt = ICManagementCanister.create({
    agent,
  });

  const { canister: nnsDapp } = await nnsDappCanister({ identity });

  return { cmc, icMgt, nnsDapp };
};
