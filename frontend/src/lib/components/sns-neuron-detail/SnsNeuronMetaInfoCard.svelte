<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { secondsToDate } from "../../utils/date.utils";
  import Value from "../ui/Value.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronCard from "../sns-neurons/SnsNeuronCard.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "../../types/sns-neuron-detail.context";
  import { getContext } from "svelte";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined;
  $: neuron = $store.neuron;
</script>

{#if neuron !== undefined}
  <SnsNeuronCard {neuron} cardType="info">
    <section>
      <p>
        <Value>{secondsToDate(Number(neuron.created_timestamp_seconds))}</Value>
        - {$i18n.neurons.staked}
      </p>
    </section>
  </SnsNeuronCard>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  section {
    padding: var(--padding) 0 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
