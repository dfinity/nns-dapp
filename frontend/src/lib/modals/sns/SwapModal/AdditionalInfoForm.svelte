<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import Icp from "../../../components/ic/ICP.svelte";
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
    <Icp singleLine icp={maxCommitment} />
  </p>
{:else}
  <KeyValuePair>
    <IcpText slot="key" icp={minCommitment}>
      {$i18n.core.min}
    </IcpText>
    <IcpText slot="value" icp={maxCommitment}>
      {$i18n.core.max}
    </IcpText>
  </KeyValuePair>
{/if}
<p class="right">
  <span>{$i18n.accounts.transaction_fee}</span>
  <Icp singleLine icp={$mainTransactionFeeStoreAsIcp} />
</p>

<style lang="scss">
  p {
    margin: 0;
  }

  .right {
    text-align: right;
  }
</style>
