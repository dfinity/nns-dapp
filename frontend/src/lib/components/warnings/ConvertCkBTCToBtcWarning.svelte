<script lang="ts">
  import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";
  import { isArrayEmpty } from "$lib/utils/utils";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { layoutWarningToastId } from "$lib/stores/layout.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

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
      labelKey: "a_sub_title",
      level: "custom",
      position: "top",
      title: "TODO: conversion not finished",
      truncate: true,
      theme: "inverted",
    });

    bitcoinConvertBlockIndexes.reset();
  };

  $: $authStore.identity, showWarning();
</script>

<!-- display unfinished convert ckBTC to Btc warnings -->
