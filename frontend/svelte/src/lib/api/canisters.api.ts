import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, SubAccount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { CMCCanister } from "../canisters/cmc/cmc.canister";
import { CMCError, ProcessingError } from "../canisters/cmc/cmc.errors";
import type { Cycles } from "../canisters/cmc/cmc.types";
import { principalToSubAccount } from "../canisters/cmc/utils";
import { ICManagementCanister } from "../canisters/ic-management/ic-management.canister";
import type {
  CanisterDetails,
  CanisterSettings,
} from "../canisters/ic-management/ic-management.canister.types";
import type { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import { CanisterAlreadyAttachedError } from "../canisters/nns-dapp/nns-dapp.errors";
import type {
  CanisterDetails as CanisterInfo,
  SubAccountArray,
} from "../canisters/nns-dapp/nns-dapp.types";
import { CYCLES_MINTING_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { poll, PollingLimitExceededError } from "../utils/utils";
import { CREATE_CANISTER_MEMO, TOP_UP_CANISTER_MEMO } from "./constants.api";
import { sendICP } from "./ledger.api";
import { nnsDappCanister } from "./nns-dapp.api";
import { toSubAccountId } from "./utils.api";

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

export const getIcpToCyclesExchangeRate = async (
  identity: Identity
): Promise<bigint> => {
  logWithTimestamp("Getting ICP to Cycles ratio call...");
  const { cmc } = await canisters(identity);

  const response = await cmc.getIcpToCyclesConversionRate();

  logWithTimestamp("Getting ICP to Cycles ratio complete.");

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

export const updateSettings = async ({
  identity,
  settings,
  canisterId,
}: {
  identity: Identity;
  settings: Partial<CanisterSettings>;
  canisterId: Principal;
}): Promise<void> => {
  logWithTimestamp("Updating canister settings call...");
  const { icMgt } = await canisters(identity);

  await icMgt.updateSettings({
    canisterId,
    settings,
  });

  logWithTimestamp("Updating canister settings call complete.");
};

export const detachCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<void> => {
  logWithTimestamp("Detaching canister call...");
  const { nnsDapp } = await canisters(identity);

  await nnsDapp.detachCanister(canisterId);

  logWithTimestamp("Detaching canister call complete.");
};

const pollingLimit = (error: Error): boolean =>
  error instanceof PollingLimitExceededError;
const notProcessingError = (error: Error): boolean =>
  !(error instanceof ProcessingError);

// Polls CMC waiting for a reponse that is not a ProcessingError.
const pollNotifyCreateCanister = async ({
  cmc,
  controller,
  blockHeight,
}: {
  cmc: CMCCanister;
  controller: Principal;
  blockHeight: bigint;
}): Promise<Principal> => {
  try {
    return await poll({
      fn: (): Promise<Principal> =>
        cmc.notifyCreateCanister({
          controller,
          block_index: blockHeight,
        }),
      shouldExit: notProcessingError,
    });
  } catch (error) {
    if (pollingLimit(error)) {
      // TODO: i18n errors https://dfinity.atlassian.net/browse/L2-721
      throw new CMCError(
        "Error creating canister. Canister might be created, refresh the page. Try again if not."
      );
    }
    throw error;
  }
};

export const createCanister = async ({
  identity,
  amount,
  name,
  fromSubAccount,
}: {
  identity: Identity;
  amount: ICP;
  name?: string;
  fromSubAccount?: SubAccountArray;
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
  const fromSubAccountId =
    fromSubAccount !== undefined ? toSubAccountId(fromSubAccount) : undefined;

  // Transfer the funds
  const blockHeight = await sendICP({
    memo: CREATE_CANISTER_MEMO,
    identity,
    to: recipient.toHex(),
    amount,
    fromSubAccountId,
  });

  // If this fails or the client loses connection, nns dapp backend polls the transactions
  // and will also notify to CMC the transaction if it's pending.
  // If the backend is faster to notify, we might get a ProcessingError.
  // We poll CMC until we stop getting ProcessingError or we request more than DEFAUL_MAX_POLLING_ATTEMPTS
  const canisterId = await pollNotifyCreateCanister({
    cmc,
    controller: principal,
    blockHeight,
  });

  // Attach the canister to the user in the nns-dapp.
  // The same background tasks that notifies the CMC also attaches the canister.
  // `name` is mandatory and unique per user, but it can be an empty string.
  try {
    await nnsDapp.attachCanister({
      name: name ?? "",
      canisterId,
    });
  } catch (error) {
    // If the background task finishes earlier, we might get CanisterAlreadyAttachedError.
    // Which can be safely ignored.
    if (!(error instanceof CanisterAlreadyAttachedError)) {
      throw error;
    }
  }

  logWithTimestamp("Create canister complete.");

  return canisterId;
};

// Polls CMC waiting for a reponse that is not a ProcessingError.
const pollNotifyTopUpCanister = async ({
  cmc,
  blockHeight,
  canisterId,
}: {
  cmc: CMCCanister;
  canisterId: Principal;
  blockHeight: bigint;
  counter?: number;
}): Promise<Cycles> => {
  try {
    return await poll({
      fn: (): Promise<Cycles> =>
        cmc.notifyTopUp({
          canister_id: canisterId,
          block_index: blockHeight,
        }),
      shouldExit: notProcessingError,
    });
  } catch (error) {
    if (pollingLimit(error)) {
      // TODO: i18n errors https://dfinity.atlassian.net/browse/L2-721
      throw new CMCError(
        "Error topping up canister. ICP might have been transferred, refresh the page. Try again if not."
      );
    }
    throw error;
  }
};

export const topUpCanister = async ({
  identity,
  canisterId,
  amount,
  fromSubAccount,
}: {
  identity: Identity;
  canisterId: Principal;
  amount: ICP;
  fromSubAccount?: SubAccountArray;
}): Promise<void> => {
  logWithTimestamp(`Topping up canister ${canisterId.toText()} call...`);

  const { cmc } = await canisters(identity);
  const toSubAccount = principalToSubAccount(canisterId);
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });
  const fromSubAccountId =
    fromSubAccount !== undefined ? toSubAccountId(fromSubAccount) : undefined;
  const blockHeight = await sendICP({
    memo: TOP_UP_CANISTER_MEMO,
    identity,
    amount,
    to: recipient.toHex(),
    fromSubAccountId,
  });

  // If this fails or the client loses connection
  // nns dapp backend polls the transactions
  // and will also notify to CMC the transaction if it's pending
  await pollNotifyTopUpCanister({ cmc, canisterId, blockHeight });

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
