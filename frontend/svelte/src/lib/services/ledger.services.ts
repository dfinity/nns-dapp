import type { Identity } from "@dfinity/agent";
import { nnsDappCanister } from "../api/nns-dapp.api";
import { LedgerConnectionState } from "../constants/ledger.constants";
import { LedgerErrorKey } from "../errors/ledger.errors";
import { LedgerIdentity } from "../identities/ledger.identity";
import { toastsStore } from "../stores/toasts.store";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { syncAccounts } from "./accounts.services";
import { getIdentity } from "./auth.services";
import {HardwareWalletAttachError} from '../canisters/nns-dapp/nns-dapp.errors';

export interface ConnectToHardwareWalletParams {
  connectionState: LedgerConnectionState;
  ledgerIdentity?: LedgerIdentity;
}

export interface RegisterHardwareWalletParams {
  name: string | undefined;
  ledgerIdentity: LedgerIdentity | undefined;
}

/**
 * Create a LedgerIdentity using the Web USB transport
 */
export const connectToHardwareWallet = async (
  callback: (params: ConnectToHardwareWalletParams) => void
): Promise<void> => {
  try {
    callback({ connectionState: LedgerConnectionState.CONNECTING });

    const ledgerIdentity: LedgerIdentity = await LedgerIdentity.create();

    callback({
      connectionState: LedgerConnectionState.CONNECTED,
      ledgerIdentity,
    });
  } catch (err: unknown) {
    const ledgerErrorKey: boolean = err instanceof LedgerErrorKey;

    toastsStore.error({
      labelKey: ledgerErrorKey
        ? (err as LedgerErrorKey).message
        : "error__ledger.unexpected",
      ...(!ledgerErrorKey && { err }),
    });

    callback({ connectionState: LedgerConnectionState.NOT_CONNECTED });
  }
};

export const registerHardwareWallet = async ({
  name,
  ledgerIdentity,
}: RegisterHardwareWalletParams): Promise<void> => {
  if (name === undefined) {
    toastsStore.error({
      labelKey: "error_attach_wallet.no_name",
    });
    return;
  }

  if (ledgerIdentity === undefined) {
    toastsStore.error({
      labelKey: "error_attach_wallet.no_identity",
    });
    return;
  }

  logWithTimestamp(`Register hardware wallet ${hashCode(name)}...`);

  const identity: Identity = await getIdentity();

  try {
    const { canister } = await nnsDappCanister({ identity });

    await canister.registerHardwareWallet({
      name,
      principal: ledgerIdentity.getPrincipal(),
    });

    logWithTimestamp(`Register hardware wallet ${hashCode(name)} complete.`);

    await syncAccounts();
  } catch (err: unknown) {
    const ledgerErrorKey: boolean = err instanceof HardwareWalletAttachError;

    toastsStore.error({
      labelKey: ledgerErrorKey
          ? (err as HardwareWalletAttachError).message
          : "error_attach_wallet.unexpected",
      ...(!ledgerErrorKey && { err }),
    });
  }
};
