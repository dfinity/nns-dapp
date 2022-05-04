import { LedgerConnectionState } from "../constants/ledger.constants";
import { LedgerErrorKey } from "../errors/ledger.errors";
import { LedgerIdentity } from "../identities/ledger.identity";
import { toastsStore } from "../stores/toasts.store";

export interface ConnectToHardwareWalletParams {
  connectionState: LedgerConnectionState;
  ledgerIdentity?: LedgerIdentity;
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
