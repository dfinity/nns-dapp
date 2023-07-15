<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formattedTotalMaturity } from "$lib/utils/neuron.utils";
  import { Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsStakedMaturityActionItem from "./NnsStakedMaturityActionItem.svelte";

  export let neuron: NeuronInfo;
</script>

<Section testId="nns-neuron-maturity-section-component">
  <h3 slot="title">{$i18n.neuron_detail.maturity_title}</h3>
  <h3 slot="end" data-tid="total-maturity">
    {formattedTotalMaturity(neuron)}
  </h3>
  <p slot="description">
    {$i18n.neuron_detail.maturity_section_description}
  </p>
  <ul class="content">
    <NnsStakedMaturityActionItem {neuron} />
  </ul>
</Section>
