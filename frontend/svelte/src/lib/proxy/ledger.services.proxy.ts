import type {
  ConnectToHardwareWalletParams,
  RegisterHardwareWalletParams,
} from "../services/ledger.services";

export const connectToHardwareWalletProxy = async (
  callback: (params: ConnectToHardwareWalletParams) => void
): Promise<void> => {
  const { connectToHardwareWallet } = await import(
    "../services/ledger.services"
  );

  return connectToHardwareWallet(callback);
};

export const registerHardwareWalletProxy = async (
  params: RegisterHardwareWalletParams
): Promise<void> => {
  const { registerHardwareWallet } = await import(
    "../services/ledger.services"
  );

  return registerHardwareWallet(params);
};
