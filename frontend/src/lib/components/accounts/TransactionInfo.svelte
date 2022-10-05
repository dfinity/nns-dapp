<script lang="ts">
  import { i18n } from "$lib/utils/i18n";
  import { mainTransactionFeeStore } from "$lib/utils/transaction-fees.store";
  import { formattedTransactionFeeICP } from "$lib/utils/icp.utils";
  import Value from "../ui/Value.svelte";
  import type { TokenAmount } from "@dfinity/nns";

  export let feeOnly = false;
  export let source: string;
  export let destination: string;
  export let hardwareWallet = false;
  export let fee: TokenAmount | undefined = undefined;
</script>

{#if !feeOnly}
  <p class="label">
    {$i18n.accounts.source}{hardwareWallet
      ? ` – ${$i18n.accounts.hardware_wallet_text}`
      : ""}
  </p>
  <p class="value">{source}</p>

  <p class="label">{$i18n.accounts.destination}</p>
  <p class="value">{destination}</p>
{/if}

<p class="label">{$i18n.accounts.transaction_fee}</p>

<p class="fee">
  <Value
    >{formattedTransactionFeeICP(
      fee?.toE8s() ?? $mainTransactionFeeStore
    )}</Value
  >
  {fee?.token.symbol ?? $i18n.core.icp}
</p>

<style lang="scss">
  p {
    margin: 0 0 var(--padding-0_5x);
    word-wrap: break-word;
  }

  .fee {
    flex-grow: 1;
  }
</style>
