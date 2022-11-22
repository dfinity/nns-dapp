<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDate } from "$lib/utils/date.utils";
  import { Value } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronCard from "../sns-neurons/SnsNeuronCard.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import {
    getSnsNeuronState,
  } from "$lib/utils/sns-neuron.utils";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { NeuronState } from "@dfinity/nns";
  import { KeyValuePair } from "@dfinity/gix-components";
  import SnsNeuronCardTitle from "$lib/components/neurons/SnsNeuronCardTitle.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import SnsNeuronAge from "$lib/components/neurons/SnsNeuronAge.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);
</script>

{#if nonNullish(neuron) && nonNullish(neuronState)}
  <div class="content-cell-details">
    <KeyValuePair>
      <SnsNeuronCardTitle tagName="h3" {neuron} slot="key" />
      <NeuronStateInfo state={neuronState} slot="value" />
    </KeyValuePair>

    <SnsNeuronAge {neuron} />
  </div>

  <Separator />

  <SnsNeuronCard {neuron} cardType="info">

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
