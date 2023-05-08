<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";

  export let fee: bigint | undefined | null = undefined;
  export let testId: string | undefined = undefined;
</script>

{#if nonNullish(fee)}
  <div data-tid={testId}>
    <p class="label subtitle"><slot /></p>
    <p class="value">
      {formatEstimatedFee(fee)}
      <span class="label">{$i18n.ckbtc.btc}</span>
    </p>
  </div>
{/if}

<style lang="scss">
  .subtitle {
    margin: 0 0 var(--padding-0_5x);
  }

  .value {
    margin: 0;
  }
</style>
