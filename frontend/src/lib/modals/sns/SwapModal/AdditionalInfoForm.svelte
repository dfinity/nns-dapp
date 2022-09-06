<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import AmountDisplay from "../../../components/ic/AmountDisplay.svelte";
  import IcpText from "../../../components/ic/ICPText.svelte";
  import KeyValuePair from "../../../components/ui/KeyValuePair.svelte";
  import { i18n } from "../../../stores/i18n";
  import { mainTransactionFeeStoreAsIcp } from "../../../stores/transaction-fees.store";

  export let userHasParticipated: boolean;
  export let minCommitment: ICP;
  export let maxCommitment: ICP;
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
  <AmountDisplay singleLine amount={$mainTransactionFeeStoreAsIcp} />
</p>

<style lang="scss">
  p {
    margin: 0;
  }

  .right {
    text-align: right;
  }
</style>
