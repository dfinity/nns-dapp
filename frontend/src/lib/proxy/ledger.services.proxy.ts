import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";
import type { LedgerIdentity } from "../identities/ledger.identity";
import type {
  ConnectToHardwareWalletParams,
  RegisterHardwareWalletParams,
} from "../services/ledger.services";

const importLedgerServices = () => import("../services/ledger.services");

export const connectToHardwareWalletProxy = async (
  callback: (params: ConnectToHardwareWalletParams) => void
): Promise<void> => {
  const { connectToHardwareWallet } = await importLedgerServices();

  return connectToHardwareWallet(callback);
};

export const registerHardwareWalletProxy = async (
  params: RegisterHardwareWalletParams
): Promise<void> => {
  const { registerHardwareWallet } = await importLedgerServices();

  return registerHardwareWallet(params);
};

export const getLedgerIdentityProxy = async (
  identifier: string
): Promise<LedgerIdentity> => {
  const { getLedgerIdentity } = await importLedgerServices();

  return getLedgerIdentity(identifier);
};

export const showAddressAndPubKeyOnHardwareWalletProxy = async () => {
  const { showAddressAndPubKeyOnHardwareWallet } = await importLedgerServices();
  return showAddressAndPubKeyOnHardwareWallet();
};

export const listNeuronsHardwareWalletProxy = async (): Promise<{
  neurons: NeuronInfo[];
  err?: string;
}> => {
  const { listNeuronsHardwareWallet } = await importLedgerServices();
  return listNeuronsHardwareWallet();
};

export const isLedgerIdentityProxy = async (
  identity: Identity
): Promise<boolean> => {
  const { LedgerIdentity } = await import("../identities/ledger.identity");
  return identity instanceof LedgerIdentity;
};
