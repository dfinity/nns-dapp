import { queryNeurons } from "$lib/api/governance.api";
import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import { LedgerConnectionState } from "$lib/constants/ledger.constants";
import { LedgerIdentity } from "$lib/identities/ledger.identity";
import { i18n } from "$lib/stores/i18n";
import { toastsError } from "$lib/stores/toasts.store";
import { LedgerErrorKey, LedgerErrorMessage } from "$lib/types/ledger.errors";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import { toToastError } from "$lib/utils/error.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { smallerVersion } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { principalToAccountIdentifier, type NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";
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

    const ledgerIdentity: LedgerIdentity = await createLedgerIdentity();

    callback({
      connectionState: LedgerConnectionState.CONNECTED,
      ledgerIdentity,
    });
  } catch (err: unknown) {
    const ledgerErrorKey = err instanceof LedgerErrorKey;

    toastsError({
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
    toastsError({
      labelKey: "error__attach_wallet.no_name",
    });
    return;
  }

  if (ledgerIdentity === undefined) {
    toastsError({
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
    toastUnexpectedError({
      err,
      fallbackErrorLabelKey: "error__attach_wallet.unexpected",
    });
  }
};

const createLedgerIdentity = (): Promise<LedgerIdentity> =>
  LedgerIdentity.create();

/**
 * Unlike getIdentity(), getting the ledger identity does not automatically logout if no identity is found - i.e. if errors happen.
 * User might need several tries to attach properly the ledger to the computer.
 */
export const getLedgerIdentity = async (
  identifier: string
): Promise<LedgerIdentity> => {
  const ledgerIdentity: LedgerIdentity = await createLedgerIdentity();

  const ledgerIdentifier = principalToAccountIdentifier(
    ledgerIdentity.getPrincipal()
  );

  if (ledgerIdentifier !== identifier) {
    const labels = get(i18n);

    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.incorrect_identifier, {
        $identifier: `${identifier}`,
        $ledgerIdentifier: `${ledgerIdentifier}`,
      })
    );
  }

  return ledgerIdentity;
};

export const showAddressAndPubKeyOnHardwareWallet = async () => {
  try {
    const ledgerIdentity: LedgerIdentity = await createLedgerIdentity();
    await ledgerIdentity.showAddressAndPubKeyOnDevice();
  } catch (err: unknown) {
    toastUnexpectedError({
      err,
      fallbackErrorLabelKey: "error__ledger.unexpected",
    });
  }
};

const toastUnexpectedError = ({
  err,
  fallbackErrorLabelKey,
}: {
  fallbackErrorLabelKey: string;
  err: unknown;
}) =>
  toastsError(
    toToastError({
      err,
      fallbackErrorLabelKey,
    })
  );

export const listNeuronsHardwareWallet = async (): Promise<{
  neurons: NeuronInfo[];
  err?: string;
}> => {
  try {
    const ledgerIdentity: LedgerIdentity = await createLedgerIdentity();
    const neurons: NeuronInfo[] = await queryNeurons({
      identity: ledgerIdentity,
      certified: true,
    });

    return { neurons };
  } catch (err: unknown) {
    const fallbackErrorLabelKey = "error__ledger.unexpected";
    toastUnexpectedError({
      err,
      fallbackErrorLabelKey,
    });
    return { neurons: [], err: fallbackErrorLabelKey };
  }
};

export const assertLedgerVersion = async ({
  identity,
  minVersion,
}: {
  identity: Identity | LedgerIdentity;
  minVersion: string;
}): Promise<void> => {
  // Ignore when identity not LedgerIdentity
  if (!(identity instanceof LedgerIdentity)) {
    return;
  }

  const { major, minor, patch } = await identity.getVersion();
  const currentVersion = `${major}.${minor}.${patch}`;
  if (smallerVersion({ currentVersion, minVersion })) {
    const labels = get(i18n);
    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.version_not_supported, {
        $minVersion: minVersion,
        $currentVersion: currentVersion,
      })
    );
  }
};
