import { createAgent } from "$lib/api/agent.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { HOST } from "$lib/constants/environment.constants";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import type { Agent, Identity } from "@dfinity/agent";
import {
  IcrcLedgerCanister,
  type IcrcAccount,
  type IcrcBlockIndex,
  type TransferParams,
} from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import {
  arrayOfNumberToUint8Array,
  isNullish,
  nonNullish,
  toNullable,
} from "@dfinity/utils";

/**
 * Similar to `getIcrcToken` but it expects the canister id instead of the function that queries the metada.
 */
export const queryIcrcToken = async ({
  certified,
  identity,
  canisterId,
}: {
  certified: boolean;
  identity: Identity;
  canisterId: Principal;
}): Promise<IcrcTokenMetadata> => {
  const {
    canister: { metadata },
  } = await icrcLedgerCanister({ identity, canisterId });

  const tokenData = await metadata({ certified });

  const token = mapOptionalToken(tokenData);

  if (isNullish(token)) {
    throw new LedgerErrorKey("error.icrc_token_load");
  }

  return token;
};

export const queryIcrcBalance = async ({
  identity,
  certified,
  canisterId,
  account,
}: {
  identity: Identity;
  certified: boolean;
  canisterId: Principal;
  account: IcrcAccount;
}): Promise<bigint> => {
  const {
    canister: { balance },
  } = await icrcLedgerCanister({ identity, canisterId });

  return balance({ ...account, certified });
};

export interface IcrcTransferParams {
  to: IcrcAccount;
  amount: bigint;
  memo?: Uint8Array;
  fromSubAccount?: SubAccountArray;
  createdAt?: bigint;
  fee: bigint;
}

export const icrcTransfer = async ({
  identity,
  canisterId,
  ...rest
}: {
  identity: Identity;
  canisterId: Principal;
} & IcrcTransferParams): Promise<IcrcBlockIndex> => {
  logWithTimestamp("Getting ckBTC transfer: call...");

  const {
    canister: { transfer: transferApi },
  } = await icrcLedgerCanister({ identity, canisterId });

  const blockIndex = await executeIcrcTransfer({
    ...rest,
    transfer: transferApi,
  });

  logWithTimestamp("Getting ckBTC transfer: done");

  return blockIndex;
};

/**
 * Transfer Icrc tokens from one account to another.
 *
 * param.fee is mandatory to ensure that it's show for hardware wallets.
 * Otherwise, the fee would not show in the device and the user would not know how much they are paying.
 *
 * This als adds an extra layer of safety because we show the fee before the user confirms the transaction.
 */
export const executeIcrcTransfer = async ({
  to: { owner, subaccount },
  fromSubAccount,
  createdAt,
  transfer: transferApi,
  ...rest
}: IcrcTransferParams & {
  transfer: (params: TransferParams) => Promise<IcrcBlockIndex>;
}): Promise<IcrcBlockIndex> =>
  transferApi({
    to: {
      owner,
      subaccount: toNullable(subaccount),
    },
    created_at_time: createdAt ?? nowInBigIntNanoSeconds(),
    from_subaccount: nonNullish(fromSubAccount)
      ? arrayOfNumberToUint8Array(fromSubAccount)
      : undefined,
    ...rest,
  });

export const approveTransfer = async ({
  identity,
  canisterId,
  amount,
  spender,
  fromSubaccount,
  fee,
  expiresAt,
  createdAt,
  expectedAllowance,
}: {
  identity: Identity;
  canisterId: Principal;
  amount: bigint;
  spender: Principal;
  fromSubaccount?: Uint8Array;
  fee?: bigint;
  expiresAt?: bigint;
  createdAt?: bigint;
  expectedAllowance?: bigint;
}): Promise<IcrcBlockIndex> => {
  logWithTimestamp("Approving transfer: call...");

  const {
    canister: { approve },
  } = await icrcLedgerCanister({ identity, canisterId });

  const blockIndex = await approve({
    amount,
    spender: {
      owner: spender,
      subaccount: [],
    },
    from_subaccount: fromSubaccount,
    fee,
    expires_at: expiresAt,
    created_at_time: createdAt ?? nowInBigIntNanoSeconds(),
    expected_allowance: expectedAllowance,
  });

  logWithTimestamp("Approving transfer: call...");

  return blockIndex;
};

export const icrcLedgerCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: IcrcLedgerCanister;
  agent: Agent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcLedgerCanister.create({
    agent,
    canisterId,
  });

  return {
    canister,
    agent,
  };
};
