<script lang="ts">
  import NnsAvailableMaturityItemAction from "$lib/components/neuron-detail/NnsAvailableMaturityItemAction.svelte";
  import NnsStakedMaturityItemAction from "$lib/components/neuron-detail/NnsStakedMaturityItemAction.svelte";
  import ViewActiveDisbursementsItemAction from "$lib/components/neuron-detail/ViewActiveDisbursementsItemAction.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { formattedTotalMaturity } from "$lib/utils/neuron.utils";
  import { Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  type Props = {
    neuron: NeuronInfo;
  };
  const { neuron }: Props = $props();
</script>

<Section testId="nns-neuron-maturity-section-component">
  <h3 slot="title">{$i18n.neuron_detail.maturity_title}</h3>
  <p slot="end" class="title-value" data-tid="total-maturity">
    {formattedTotalMaturity(neuron)}
  </p>
  <p slot="description" class="description">
    {$i18n.neuron_detail.maturity_section_description}
  </p>
  <ul class="content">
    <NnsStakedMaturityItemAction {neuron} />
    <NnsAvailableMaturityItemAction {neuron} />
    <ViewActiveDisbursementsItemAction {neuron} />
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
