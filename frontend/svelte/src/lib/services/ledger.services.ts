import type { Identity } from "@dfinity/agent";
import { nnsDappCanister } from "../api/nns-dapp.api";
import { LedgerConnectionState } from "../constants/ledger.constants";
import { LedgerErrorKey } from "../errors/ledger.errors";
import { LedgerIdentity } from "../identities/ledger.identity";
import { toastsStore } from "../stores/toasts.store";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { toLedgerError } from "../utils/error.utils";
import { syncAccounts } from "./accounts.services";
import { getIdentity } from "./auth.services";

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

    const ledgerIdentity: LedgerIdentity = await getLedgerIdentity();

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
      labelKey: "error__attach_wallet.no_name",
    });
    return;
  }

  if (ledgerIdentity === undefined) {
    toastsStore.error({
      labelKey: "error__attach_wallet.no_identity",
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
    toastsStore.error(
      toLedgerError({
        err,
        fallbackErrorLabelKey: "error__attach_wallet.unexpected",
      })
    );
  }
};

export const getLedgerIdentity = (): Promise<LedgerIdentity> =>
  LedgerIdentity.create();
