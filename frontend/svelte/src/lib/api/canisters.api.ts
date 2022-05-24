import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, SubAccount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { CMCCanister } from "../canisters/cmc/cmc.canister";
import { principalToSubAccount } from "../canisters/cmc/utils";
import { ICManagementCanister } from "../canisters/ic-management/ic-management.canister";
import type { CanisterDetails } from "../canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";
import { CYCLES_MINTING_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { getIdentity } from "../services/auth.services";
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
  const { canister } = await nnsDappCanister({ identity });

  const response = await canister.getCanisters({ certified });

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

  // const agent = await createAgent({
  //   identity,
  //   host: HOST,
  // });
  const { cmc } = await canisters(identity);
  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  // const ledger = LedgerCanister.create({
  //   agent,
  //   canisterId: LEDGER_CANISTER_ID,
  // });
  const principal = identity.getPrincipal();
  const toSubAccount = principalToSubAccount(principal);
  // To create a canister you need to send ICP to an account owned by the CMC, so that the CMC can burn those funds.
  // To ensure everyone uses a unique address, the intended controller of the new canister is used to calculate the subaccount.
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });

  // Transfer the funds
  // const blockHeight = await ledger.transfer({
  //   memo: CREATE_CANISTER_MEMO,
  //   amount,
  //   to: recipient,
  // });
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
  const canisterPrincipal = await cmc.notifyCreateCanister({
    controller: principal,
    block_index: blockHeight,
  });

  // Attach the canister to the user in the nns-dapp.
  // `name` is mandatory and unique per user,
  // but it can be an empty string
  await nnsDapp.attachCanister({
    name: name ?? "",
    canisterId: canisterPrincipal,
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

  const { cmc } = await canisters(identity);
  // const ledger = LedgerCanister.create({
  //   agent,
  //   canisterId: LEDGER_CANISTER_ID,
  // });
  const toSubAccount = principalToSubAccount(canisterPrincipal);
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });

  // const blockHeight = await ledger.transfer({
  //   memo: TOP_UP_CANISTER_MEMO,
  //   amount,
  //   to: recipient,
  // });
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
    canister_id: canisterPrincipal,
    block_index: blockHeight,
  });

  logWithTimestamp(
    `Topping up canister ${canisterPrincipal.toText()} complete.`
  );
};

// TODO: Remove before merging
export const testCMC = async (): Promise<void> => {
  try {
    const identity = await getIdentity();
    const agent = await createAgent({
      identity,
      host: HOST,
    });

    const cmc = CMCCanister.create({
      agent,
      canisterId: CYCLES_MINTING_CANISTER_ID,
    });
    const a = await cmc.getIcpToCyclesConversionRate();
    console.log("da conversion rate: ", a);
    const canisterId = await createCanister({
      identity,
      amount: ICP.fromString("3") as ICP,
    });

    const canisterDetails = await queryCanisterDetails({
      identity,
      canisterId,
    });
    console.log(canisterDetails);

    await topUpCanister({
      identity,
      amount: ICP.fromString("1") as ICP,
      canisterPrincipal: canisterId,
    });

    const canisterDetails2 = await queryCanisterDetails({
      identity,
      canisterId,
    });
    console.log(canisterDetails2);
  } catch (error) {
    console.log("in da error");
    console.log(error);
  }
};

const canisters = async (
  identity: Identity
): Promise<{
  cmc: CMCCanister;
  icMgt: ICManagementCanister;
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

  return { cmc, icMgt };
};
