<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { emit } from "$lib/utils/events.utils";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import { i18n } from "$lib/stores/i18n";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import type { Account } from "$lib/types/account";

  export let account: Account | undefined = undefined;
  export let reload: (() => Promise<void>) | undefined = undefined;
  export let canSelectAccount = false;
  export let disableButton: boolean;
  export let canisters: CkBTCAdditionalCanisters | undefined;

  const openReceive = async () => {
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
        type: "ckbtc-receive",
        data: {
          account,
          reload,
          universeId: $selectedCkBTCUniverseIdStore,
          canisters,
          canSelectAccount,
        },
      },
    });
  };
</script>

<button
  class="secondary"
  disabled={disableButton}
  on:click={openReceive}
  data-tid="receive-ckbtc">{$i18n.ckbtc.receive}</button
>
