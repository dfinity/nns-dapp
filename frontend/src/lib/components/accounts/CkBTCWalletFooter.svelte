<script lang="ts">
  import { isNullish } from "$lib/utils/utils";
  import {
    WALLET_CONTEXT_KEY,
    type CkBTCWalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { getBTCAddress } from "$lib/services/ckbtc-minter.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { emit } from "$lib/utils/events.utils";
  import type { CkBTCWalletModal } from "$lib/types/wallet.modal";

  const context: CkBTCWalletContext =
    getContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY);
  const { store, reloadAccount }: CkBTCWalletContext = context;

  const openReceive = async () => {
    // Button is disabled if no account anyway
    if (isNullish($store.account)) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_no_account",
      });
      return;
    }

    startBusy({
      initiator: "get-btc-address",
    });

    try {
      // TODO(GIX-1303): ckBTC - derive the address in frontend. side note: should we keep track of the address in a store?
      const btcAddress = await getBTCAddress();

      emit<CkBTCWalletModal>({
        message: "ckBTCWalletModal",
        detail: {
          type: "ckbtc-receive",
          data: { btcAddress, account: $store.account, reloadAccount },
        },
      });
    } catch (err: unknown) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_address",
        err,
      });
    }

    stopBusy("get-btc-address");
  };
</script>

<button
  class="primary"
  on:click={openReceive}
  disabled={isNullish($store.account) || $busy}
  data-tid="receive-ckbtc-transaction">{$i18n.ckbtc.receive}</button
>
