<script lang="ts">
  import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";
  import { isArrayEmpty } from "$lib/utils/utils";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { layoutWarningToastId } from "$lib/stores/layout.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";

  const showWarning = () => {
    // Display a warning only if signed in
    if (!isSignedIn($authStore.identity)) {
      return;
    }

    if (isArrayEmpty($bitcoinConvertBlockIndexes)) {
      return;
    }

    toastsShow({
      id: $layoutWarningToastId,
      labelKey: "ckbtc.warning_transaction_description",
      level: "error",
      position: "top",
      title: $i18n.ckbtc.warning_transaction_failed,
      overflow: "clamp",
      theme: "inverted",
    });

    bitcoinConvertBlockIndexes.reset();
  };

  $: $authStore.identity, showWarning();
</script>

<!-- display unfinished convert ckBTC to Btc warnings -->
