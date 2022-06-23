<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { mainTransactionFeeStore } from "../../stores/transaction-fees.store";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";

  export let feeOnly: boolean = false;
  export let source: string;
  export let destination: string;
  export let hardwareWallet: boolean = false;
</script>

{#if !feeOnly}
  <h5>
    {$i18n.accounts.source}{hardwareWallet
      ? ` – ${$i18n.accounts.hardware_wallet_text}`
      : ""}
  </h5>
  <p>{source}</p>

  <h5>{$i18n.accounts.destination}</h5>
  <p>{destination}</p>
{/if}

<h5>{$i18n.accounts.transaction_fee}</h5>

<p class="fee">
  {formattedTransactionFeeICP($mainTransactionFeeStore)}
  {$i18n.core.icp}
</p>

<style lang="scss">
  h5 {
    margin: 0;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    word-wrap: break-word;
  }

  .fee {
    flex-grow: 1;
  }
</style>
