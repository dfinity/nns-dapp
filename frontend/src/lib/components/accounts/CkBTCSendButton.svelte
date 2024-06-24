<script lang="ts">
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { emit } from "$lib/utils/events.utils";
  import { isNullish } from "@dfinity/utils";

  export let account: Account | undefined = undefined;
  export let disableButton: boolean;
  export let reloadAccountFromStore: (() => void) | undefined = undefined;
  export let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  export let loadTransactions = false;

  const openSend = () => {
    // Button is disabled if no universe anyway
    if (isNullish($selectedCkBTCUniverseIdStore) || isNullish(canisters)) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_no_universe",
      });
      return;
    }

    emit<CkBTCWalletModal>({
      message: "nnsCkBTCAccountsModal",
      detail: {
        type: "ckbtc-transaction",
        data: {
          account,
          reloadAccountFromStore,
          universeId: $selectedCkBTCUniverseIdStore,
          canisters,
          loadTransactions,
        },
      },
    });
  };
</script>

<button
  class="primary"
  on:click={openSend}
  disabled={disableButton}
  data-tid="open-ckbtc-transaction">{$i18n.accounts.send}</button
>
