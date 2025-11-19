<script lang="ts">
  import SnsAvailableMaturityItemAction from "$lib/components/sns-neuron-detail/SnsAvailableMaturityItemAction.svelte";
  import SnsStakedMaturityItemAction from "$lib/components/sns-neuron-detail/SnsStakedMaturityItemAction.svelte";
  import SnsViewActiveDisbursementsItemAction from "$lib/components/sns-neuron-detail/SnsViewActiveDisbursementsItemAction.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { formattedTotalMaturity } from "$lib/utils/sns-neuron.utils";
  import { Section } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@icp-sdk/canisters/sns";
  import type { Token, TokenAmountV2 } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let fee: TokenAmountV2;
  export let token: Token;
</script>

<Section testId="sns-neuron-maturity-section-component">
  {#snippet title()}
    <h3>{$i18n.neuron_detail.maturity_title}</h3>{/snippet}
  {#snippet end()}<p class="title-value" data-tid="total-maturity">
      {formattedTotalMaturity(neuron)}
    </p>{/snippet}
  {#snippet description()}<p class="description">
      {$i18n.neuron_detail.maturity_section_description}
    </p>{/snippet}
  <ul class="content">
    <SnsStakedMaturityItemAction {neuron} />
    <SnsAvailableMaturityItemAction {neuron} {fee} {token} />
    <SnsViewActiveDisbursementsItemAction {neuron} />
  </ul>
</Section>

<style lang="scss">
  h3,
  p {
    margin: 0;
  }

  .title-value {
    font-size: var(--font-size-h3);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);

    padding: 0;
  }
</style>
