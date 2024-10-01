<script lang="ts">
  import Metrics from "$lib/components/metrics/Metrics.svelte";
  import TestEnvironmentWarning from "$lib/components/warnings/TestEnvironmentWarning.svelte";
  import TransactionRateWarning from "$lib/components/warnings/TransactionRateWarning.svelte";
  import { IS_TEST_ENV } from "$lib/constants/mockable.constants";
  import { Toasts } from "@dfinity/gix-components";

  export let bringToastsForward = false;
  export let testEnvironmentWarning = false;
</script>

{#if !IS_TEST_ENV}
  <Metrics />
{/if}

<div class:forward={bringToastsForward}>
  <Toasts position="top" />
</div>

<TransactionRateWarning />

{#if testEnvironmentWarning}
  <TestEnvironmentWarning />
{/if}

<style lang="scss">
  .forward {
    // On login screen z-index for toasts need an extra push
    --toast-info-z-index: calc(var(--overlay-z-index) + 6);
    --toast-error-z-index: calc(var(--overlay-z-index) + 9);
  }
</style>
