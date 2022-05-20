import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  AccountIdentifier,
  ICP,
  LedgerCanister,
  SubAccount,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { CMCCanister } from "../canisters/cmc/cmc.canister";
import { principalToSubAccount } from "../canisters/cmc/utils";
import { ICManagementCanister } from "../canisters/ic-management/ic-management.canister";
import type { CanisterDetails } from "../canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { getIdentity } from "../services/auth.services";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { nnsDappCanister } from "./nns-dapp.api";

const CREATE_CANISTER_MEMO = BigInt(0x41455243); // CREA,
const TOP_UP_CANISTER_MEMO = BigInt(0x50555054); // TPUP
const CMC_CANISTER_ID = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");
const IC_MANAGEMENT_CANISTER_ID = Principal.from("aaaaa-aa");

export const queryCanisters = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<CanisterInfo[]> => {
  logWithTimestamp(`Querying Canisters certified:${certified} call...`);
  const { canister } = await nnsDappCanister({ identity });

  const response = await canister.getCanisters({ certified });

  logWithTimestamp(`Querying Canisters certified:${certified} complete.`);

  return response;
};

export const getCanisterDetails = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<CanisterDetails> => {
  logWithTimestamp(`Getting canister ${canisterId.toText()} details call...`);
  const { canister } = await icManagementCanister(identity);

  const response = await canister.getCanisterDetails(canisterId.toText());

  logWithTimestamp(`Getting canister ${canisterId.toText()} details complete.`);

  return response;
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

  const { canister: cmc, agent } = await cmcCanister(identity);
  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  const ledger = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });
  const principal = identity.getPrincipal();
  const toSubAccount = principalToSubAccount(principal);
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CMC_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });

  // Transfer the funds
  const blockHeight = await ledger.transfer({
    memo: CREATE_CANISTER_MEMO,
    amount,
    to: recipient,
  });

  // If this fails or the client loses connection
  // nns dapp backend polls the transactions
  // and will also notify to CMC the transaction if it's pending
  // TODO: Notify canister for transactions with "CMC_CANISTER_ID" instead of "OWN_CANISTER_ID"
  const canisterPrincipal = await cmc.notifyCreateCanister({
    controller: principal,
    block_index: blockHeight,
  });

  // Attach the canister to the user in the nns-dapp.
  // `name` is mandatory and unique per user,
  // but it can be an empty string
  await nnsDapp.attachCanister({
    name: name ?? "",
    canisterIdString: canisterPrincipal.toText(),
  });

  logWithTimestamp("Create canister complete.");

  return canisterPrincipal;
};

export const topUpCanister = async ({
  identity,
  canisterPrincipal,
  amount,
}: {
  identity: Identity;
  canisterPrincipal: Principal;
  amount: ICP;
}): Promise<void> => {
  logWithTimestamp(`Topping up canister ${canisterPrincipal.toText()} call...`);

  const { canister: cmc, agent } = await cmcCanister(identity);
  const ledger = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });
  const toSubAccount = principalToSubAccount(canisterPrincipal);
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CMC_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });

  const blockHeight = await ledger.transfer({
    memo: TOP_UP_CANISTER_MEMO,
    amount,
    to: recipient,
  });

  await cmc.notifyTopUp({
    canister_id: canisterPrincipal,
    block_index: blockHeight,
  });

  logWithTimestamp(
    `Topping up canister ${canisterPrincipal.toText()} complete.`
  );
};

export const testCMC = async (): Promise<void> => {
  try {
    const identity = await getIdentity();
    const canisterId = await createCanister({
      identity,
      amount: ICP.fromString("3") as ICP,
    });

    const canisterDetails = await getCanisterDetails({ identity, canisterId });
    console.log(canisterDetails);

    await topUpCanister({
      identity,
      amount: ICP.fromString("1") as ICP,
      canisterPrincipal: canisterId,
    });

    const canisterDetails2 = await getCanisterDetails({ identity, canisterId });
    console.log(canisterDetails2);
  } catch (error) {
    console.log("in da error");
    console.log(error);
  }
};

export const cmcCanister = async (
  identity: Identity
): Promise<{
  agent: HttpAgent;
  canister: CMCCanister;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = CMCCanister.create({
    agent,
    canisterId: CMC_CANISTER_ID,
  });

  return { canister, agent };
};

export const icManagementCanister = async (
  identity: Identity
): Promise<{
  agent: HttpAgent;
  canister: ICManagementCanister;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = ICManagementCanister.create({
    agent,
    canisterId: IC_MANAGEMENT_CANISTER_ID,
  });

  return { canister, agent };
};
