<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import IcpText from "$lib/components/ic/ICPText.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

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
      <span class="description">{$i18n.core.min}</span>
    </IcpText>
    <IcpText slot="value" amount={maxCommitment}>
      <span class="description">{$i18n.core.max}</span>
    </IcpText>
  </KeyValuePair>
{/if}

<style lang="scss">
  p {
    margin: 0;
  }
</style>
