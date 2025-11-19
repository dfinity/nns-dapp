import type { LedgerIdentity } from "$lib/identities/ledger.identity";
import type {
  ConnectToHardwareWalletParams,
  RegisterHardwareWalletParams,
} from "$lib/services/icp-ledger.services";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import type { Identity } from "@icp-sdk/core/agent";

const importLedgerServices = () => import("../services/icp-ledger.services");

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
