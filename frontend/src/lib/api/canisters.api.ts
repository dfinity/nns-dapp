import { createAgent } from "$lib/api/agent.api";
import { sendICP } from "$lib/api/icp-ledger.api";
import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import { ICManagementCanister } from "$lib/canisters/ic-management/ic-management.canister";
import type {
  CanisterDetails,
  CanisterSettings,
} from "$lib/canisters/ic-management/ic-management.canister.types";
import type { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import {
  CanisterAlreadyAttachedError,
  CanisterNameTooLongError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  CanisterDetails as CanisterInfo,
  SubAccountArray,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { CYCLES_MINTING_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import { HOST } from "$lib/constants/environment.constants";
import { ApiErrorKey } from "$lib/types/api.errors";
import { getCanisterCreationCmcAccountIdentifierHex } from "$lib/utils/canisters.utils";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { poll, pollingLimit } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { CMCCanister, ProcessingError, type Cycles } from "@dfinity/cmc";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";
import type { Principal } from "@dfinity/principal";
import { nonNullish, principalToSubAccount } from "@dfinity/utils";

// This way, TS understands that if it's invalid, then the name is a string
type LongName = string;
const isNameTooLong = (name: string | undefined): name is LongName =>
  nonNullish(name) && name?.length > MAX_CANISTER_NAME_LENGTH;

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

  const response = await cmc.getIcpToCyclesConversionRate({ certified: true });

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

// Attaches a canister that's not created by the user to the user account.
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

  if (isNameTooLong(name)) {
    throw new CanisterNameTooLongError("error__canister.name_too_long", {
      $name: name,
    });
  }

  const { nnsDapp } = await canisters(identity);

  await nnsDapp.attachCanister({
    name: name ?? "",
    canisterId,
    // blockIndex is only specified for canisters created by the user.
    blockIndex: undefined,
  });

  logWithTimestamp("Attaching canister call complete.");
};

export const renameCanister = async ({
  identity,
  name,
  canisterId,
}: {
  identity: Identity;
  name: string;
  canisterId: Principal;
}): Promise<void> => {
  logWithTimestamp("Renaming canister call...");

  if (isNameTooLong(name)) {
    throw new CanisterNameTooLongError("error__canister.name_too_long", {
      $name: name,
    });
  }

  const { nnsDapp } = await canisters(identity);

  await nnsDapp.renameCanister({
    name,
    canisterId,
  });

  logWithTimestamp("Renaming canister call complete.");
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

const notProcessingError = (error: unknown): boolean =>
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
          subnet_type: [],
          subnet_selection: [],
          settings: [],
        }),
      shouldExit: notProcessingError,
    });
  } catch (error: unknown) {
    if (pollingLimit(error)) {
      throw new ApiErrorKey("error.limit_exceeded_creating_canister");
    }
    throw error;
  }
};

export const createCanister = async ({
  identity,
  amount,
  name,
  fromSubAccount,
  fee,
}: {
  identity: Identity;
  amount: bigint;
  name?: string;
  fromSubAccount?: SubAccountArray;
  fee: bigint;
}): Promise<Principal> => {
  logWithTimestamp("Create canister call...");

  // Failing fast here is specially important.
  // Otherwise the transaction will take place and attaching the canister will fail.
  // Worst case, the NNS Dapp canister periodic runner will catch the transaction and attach the canister without a name.
  if (isNameTooLong(name)) {
    throw new CanisterNameTooLongError("error__canister.name_too_long", {
      $name: name,
    });
  }

  const { cmc, nnsDapp } = await canisters(identity);
  const principal = identity.getPrincipal();
  const recipientHex = getCanisterCreationCmcAccountIdentifierHex({
    controller: principal,
  });

  const createdAt = nowInBigIntNanoSeconds();
  // Transfer the funds
  const blockHeight = await sendICP({
    memo: CREATE_CANISTER_MEMO,
    identity,
    to: recipientHex,
    amount,
    fromSubAccount,
    createdAt,
    fee,
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
      blockIndex: blockHeight,
    });
  } catch (error: unknown) {
    // If the background task finishes earlier, we might get CanisterAlreadyAttachedError.
    // Which can be safely ignored.
    if (!(error instanceof CanisterAlreadyAttachedError)) {
      throw error;
    }
  }

  logWithTimestamp("Create canister complete.");

  return canisterId;
};

// Creates a canister based on a transaction that was performed before.
// Used in case the canister creation process is interrupted after ICP are
// transferred to the CMC account.
//
// If we see a funding transaction for canister creation, but no canister it can
// mean either of 2 things:
// 1. The canister was not created.
// 2. The canister was created but not attached to the user account.
//
// This function takes care of both cases because notifying the CMC will create
// the canister if it doesn't exist, or return the same response as the first
// time if it does exist. So in either case this will give us the canister ID so
// that we can attach it to the user account.
export const notifyAndAttachCanister = async ({
  identity,
  blockIndex,
}: {
  identity: Identity;
  blockIndex: bigint;
}): Promise<Principal> => {
  logWithTimestamp("Notify and attach canister...");

  const { cmc, nnsDapp } = await canisters(identity);

  const controller = identity.getPrincipal();

  const canisterId = await pollNotifyCreateCanister({
    cmc,
    controller,
    blockHeight: blockIndex,
  });

  // Attach the canister to the user in the nns-dapp.
  await nnsDapp.attachCanister({
    // We don't know the name the user originally chose so they will have to
    // rename it, if they want, after we recover the canister.
    name: "",
    canisterId,
    blockIndex,
  });

  logWithTimestamp("Notify and attach canister complete.");

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
  } catch (error: unknown) {
    if (pollingLimit(error)) {
      throw new ApiErrorKey("error.limit_exceeded_topping_up_canister.");
    }
    throw error;
  }
};

export const topUpCanister = async ({
  identity,
  canisterId,
  amount,
  fromSubAccount,
  fee,
}: {
  identity: Identity;
  canisterId: Principal;
  amount: bigint;
  fromSubAccount?: SubAccountArray;
  fee: bigint;
}): Promise<void> => {
  logWithTimestamp(`Topping up canister ${canisterId.toText()} call...`);

  const { cmc } = await canisters(identity);
  const toSubAccount = principalToSubAccount(canisterId);
  const recipient = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
  });
  const createdAt = nowInBigIntNanoSeconds();
  const blockHeight = await sendICP({
    memo: TOP_UP_CANISTER_MEMO,
    identity,
    amount,
    to: recipient.toHex(),
    fromSubAccount,
    createdAt,
    fee,
  });

  // If this fails or the client loses connection
  // nns dapp backend polls the transactions
  // and will also notify to CMC the transaction if it's pending
  await pollNotifyTopUpCanister({ cmc, canisterId, blockHeight });

  logWithTimestamp(`Topping up canister ${canisterId.toText()} complete.`);
};

// Returns the number of cycles that were topped up. But if called again, it
// will return the same number. So this can't be used to tell if the top-up
// wasn't done before.
export const notifyTopUpCanister = async ({
  identity,
  blockHeight,
  canisterId,
}: {
  identity: Identity;
  blockHeight: bigint;
  canisterId: Principal;
}): Promise<bigint> => {
  logWithTimestamp(`Notifying canister topup ${canisterId.toText()} call...`);

  const { cmc } = await canisters(identity);
  try {
    return cmc.notifyTopUp({
      canister_id: canisterId,
      block_index: blockHeight,
    });
  } finally {
    logWithTimestamp(
      `Notifying canister topup ${canisterId.toText()} complete.`
    );
  }
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
