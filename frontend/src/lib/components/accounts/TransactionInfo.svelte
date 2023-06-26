<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";
  import { formattedTransactionFeeICP } from "$lib/utils/token.utils";
  import { Value } from "@dfinity/gix-components";
  import type { TokenAmount } from "@dfinity/utils";

  export let feeOnly = false;
  export let source: string;
  export let destination: string;
  export let hardwareWallet = false;
  export let fee: TokenAmount | undefined = undefined;
</script>

{#if !feeOnly}
  <div>
    <p class="label">
      {$i18n.accounts.source}{hardwareWallet
        ? ` – ${$i18n.accounts.hardware_wallet_text}`
        : ""}
    </p>
    <p class="value">{source}</p>
  </div>

  <div>
    <p class="label">{$i18n.accounts.destination}</p>
    <p class="value">{destination}</p>
  </div>
{/if}

<div>
  <p class="label">{$i18n.accounts.transaction_fee}</p>

  <p class="fee">
    <Value
      >{formattedTransactionFeeICP(
        fee?.toE8s() ?? $mainTransactionFeeStore
      )}</Value
    >
    {fee?.token.symbol ?? $i18n.core.icp}
  </p>
</div>

<style lang="scss">
  p {
    margin: 0 0 var(--padding-0_5x);
    word-wrap: break-word;
  }

  .fee {
    flex-grow: 1;
  }
</style>
