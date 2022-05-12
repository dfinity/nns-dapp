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
