<script lang="ts">
  import TransactionRateWarning from "$lib/components/metrics/TransactionRateWarning.svelte";
  import {ENABLE_METRICS} from "$lib/constants/environment.constants";
  import Metrics from "$lib/components/metrics/Metrics.svelte";
  import { Toasts } from "@dfinity/gix-components";

  export let bringToastsForward = false
</script>

{#if ENABLE_METRICS}
    <Metrics />
{/if}

<div class:forward={bringToastsForward}>
    <Toasts position="top" />
</div>

<TransactionRateWarning />

<style lang="scss">
    .forward {
      // On login screen z-index for toasts need an extra push
      --toast-info-z-index: calc(var(--overlay-z-index) + 6);
      --toast-error-z-index: calc(var(--overlay-z-index) + 9);
    }
</style>