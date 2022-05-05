import type { ConnectToHardwareWalletParams } from "../services/ledger.services";

export const connectToHardwareWalletProxy = async (
  callback: (params: ConnectToHardwareWalletParams) => void
): Promise<void> => {
  const { connectToHardwareWallet } = await import(
    "../services/ledger.services"
  );

  return connectToHardwareWallet(callback);
};
