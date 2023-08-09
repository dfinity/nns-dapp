<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Section } from "@dfinity/gix-components";
  import SnsStakedMaturityItemAction from "./SnsStakedMaturityItemAction.svelte";
  import SnsAvailableMaturityItemAction from "./SnsAvailableMaturityItemAction.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { formattedTotalMaturity } from "$lib/utils/sns-neuron.utils";

  export let neuron: SnsNeuron;
</script>

<Section testId="sns-neuron-maturity-section-component">
  <h3 slot="title">{$i18n.neuron_detail.maturity_title}</h3>
  <p slot="end" class="title-value" data-tid="total-maturity">
    {formattedTotalMaturity(neuron)}
  </p>
  <p slot="description" class="description">
    {$i18n.neuron_detail.maturity_section_description}
  </p>
  <ul class="content">
    <SnsStakedMaturityItemAction {neuron} />
    <SnsAvailableMaturityItemAction {neuron} />
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
