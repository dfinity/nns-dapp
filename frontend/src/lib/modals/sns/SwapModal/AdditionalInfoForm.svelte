<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import IcpText from "$lib/components/ic/ICPText.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";

  export let userHasParticipated: boolean;
  export let minCommitment: TokenAmount;
  export let maxCommitment: TokenAmount;
</script>

{#if userHasParticipated}
  <p class="right">
    {$i18n.sns_project_detail.max_left}
    <AmountDisplay singleLine amount={maxCommitment} />
  </p>
{:else}
  <KeyValuePair>
    <IcpText slot="key" amount={minCommitment}>
      {$i18n.core.min}
    </IcpText>
    <IcpText slot="value" amount={maxCommitment}>
      {$i18n.core.max}
    </IcpText>
  </KeyValuePair>
{/if}
<p class="right">
  <span>{$i18n.accounts.transaction_fee}</span>
  <AmountDisplay singleLine amount={$mainTransactionFeeStoreAsToken} />
</p>

<style lang="scss">
  p {
    margin: 0;
  }

  .right {
    text-align: right;
  }
</style>
