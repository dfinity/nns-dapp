import { LedgerConnectionState } from "../constants/ledger.constants";
import { LedgerErrorKey } from "../errors/ledger.errors";
import { LedgerIdentity } from "../identities/ledger.identity";
import { toastsStore } from "../stores/toasts.store";

/**
 * Create a LedgerIdentity using the Web USB transport
 */
export const connectToHardwareWallet = async (
  connectionState: (LedgerConnectionState) => void
): Promise<void> => {
  try {
    connectionState(LedgerConnectionState.CONNECTING);

    await LedgerIdentity.create();

    connectionState(LedgerConnectionState.CONNECTED);
  } catch (err: unknown) {
    const ledgerErrorKey: boolean = err instanceof LedgerErrorKey;

    toastsStore.error({
      labelKey: ledgerErrorKey
        ? (err as LedgerErrorKey).message
        : "error__ledger.unexpected",
      ...(!ledgerErrorKey && { err }),
    });

    connectionState(LedgerConnectionState.NOT_CONNECTED);
  }
};
