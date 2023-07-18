<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formattedTotalMaturity } from "$lib/utils/neuron.utils";
  import { Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsStakedMaturityActionItem from "./NnsStakedMaturityActionItem.svelte";
  import NnsAvailableMaturityActionItem from "./NnsAvailableMaturityActionItem.svelte";

  export let neuron: NeuronInfo;
</script>

<Section testId="nns-neuron-maturity-section-component">
  <h3 slot="title">{$i18n.neuron_detail.maturity_title}</h3>
  <p slot="end" class="title-value" data-tid="total-maturity">
    {formattedTotalMaturity(neuron)}
  </p>
  <p slot="description">
    {$i18n.neuron_detail.maturity_section_description}
  </p>
  <ul class="content">
    <NnsStakedMaturityActionItem {neuron} />
    <NnsAvailableMaturityActionItem {neuron} />
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
