import type { WalletModal } from "$lib/types/wallet.modal";
import { emit } from "$lib/utils/events.utils";

export const openWalletModal = (detail: WalletModal) =>
  emit<WalletModal>({
    message: "nnsWalletModal",
    detail,
  });
