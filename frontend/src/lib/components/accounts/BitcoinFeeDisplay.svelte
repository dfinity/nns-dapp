<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let fee: bigint | undefined | null = undefined;
  export let testId: string | undefined = undefined;
</script>

{#if nonNullish(fee)}
  <KeyValuePair {testId}>
    <span class="label" slot="key"><slot /></span>
    <span class="value tabular-num" slot="value">
      {formatEstimatedFee(fee)}
      <span class="label">{$i18n.ckbtc.btc}</span>
    </span>
  </KeyValuePair>
{/if}

<style lang="scss">
  .value {
    text-align: right;
  }
</style>
