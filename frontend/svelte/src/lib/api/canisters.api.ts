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
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { getIdentity } from "../services/auth.services";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { nnsDappCanister } from "./nns-dapp.api";

export const CREATE_CANISTER_MEMO = BigInt(0x41455243); // CREA,

export const queryCanisters = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<CanisterDetails[]> => {
  logWithTimestamp(`Querying Canisters certified:${certified} call...`);
  const { canister } = await nnsDappCanister({ identity });

  const response = await canister.getCanisters({ certified });

  logWithTimestamp(`Querying Canisters certified:${certified} complete.`);

  return response;
};

export const testCMC = async (): Promise<void> => {
  try {
    const identity = await getIdentity();
    const principal = identity.getPrincipal();
    const { canister, agent } = await cmcCanister(identity);
    const ledger = LedgerCanister.create({
      agent,
      canisterId: LEDGER_CANISTER_ID,
    });

    const toSubAccount = principalToSubAccount(principal);
    const recipient = AccountIdentifier.fromPrincipal({
      principal: OWN_CANISTER_ID,
      subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
    });

    console.log("before da ledger call");
    const blockHeight = await ledger.transfer({
      memo: CREATE_CANISTER_MEMO,
      amount: ICP.fromString("3") as ICP,
      to: recipient,
    });

    console.log("before da cmc call");
    const response = await canister.notifyCreateCanister({
      controller: OWN_CANISTER_ID,
      block_index: blockHeight,
    });
    console.log("after da cmc call");
    console.log(response);
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
    canisterId: Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai"),
  });

  return { canister, agent };
};
