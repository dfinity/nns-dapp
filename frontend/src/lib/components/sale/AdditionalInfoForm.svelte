<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import IcpText from "$lib/components/ic/ICPText.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { Checkbox } from "@dfinity/gix-components";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let conditionsToAccept: string | undefined = undefined;
  export let areConditionsAccepted = false;

  export let userHasParticipated: boolean;
  export let minCommitment: TokenAmount;
  export let maxCommitment: TokenAmount;
</script>

<div data-tid="additional-info-form-component" class="additional-info">
  {#if nonNullish(conditionsToAccept)}
    <Checkbox
      text="block"
      inputId="agree"
      checked={areConditionsAccepted}
      on:nnsChange={() => (areConditionsAccepted = !areConditionsAccepted)}
    >
      <span data-tid="conditions">{conditionsToAccept}</span>
    </Checkbox>
  {/if}

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
</div>

<style lang="scss">
  p {
    margin: 0;
  }
  .additional-info {
    --checkbox-label-order: 1;
    --padding: var(--padding-2x);
    --checkbox-padding: var(--padding) 0;
  }
</style>
