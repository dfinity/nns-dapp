<script lang="ts">
  import TransactionRateWarning from "$lib/components/warnings/TransactionRateWarning.svelte";
  import { ENABLE_METRICS } from "$lib/constants/mockable.constants";
  import Metrics from "$lib/components/metrics/Metrics.svelte";
  import { Toasts } from "@dfinity/gix-components";
  import ConvertCkBTCToBtcWarning from "$lib/components/warnings/ConvertCkBTCToBtcWarning.svelte";

  export let bringToastsForward = false;
  export let ckBTCWarnings = false;
</script>

{#if ENABLE_METRICS}
  <Metrics />
{/if}

<div class:forward={bringToastsForward}>
  <Toasts position="top" />
</div>

<TransactionRateWarning />

{#if ckBTCWarnings}
  <ConvertCkBTCToBtcWarning />
{/if}

<style lang="scss">
  .forward {
    // On login screen z-index for toasts need an extra push
    --toast-info-z-index: calc(var(--overlay-z-index) + 6);
    --toast-error-z-index: calc(var(--overlay-z-index) + 9);
  }
</style>
