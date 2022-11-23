<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { formattedSnsMaturity } from "$lib/utils/sns-neuron.utils";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;
</script>

<CardInfo>
  <KeyValuePair testId="maturity">
    <h3 slot="key">{$i18n.neuron_detail.maturity_title}</h3>
    <h3 slot="value">{formattedSnsMaturity(neuron)}</h3>
  </KeyValuePair>
</CardInfo>

<Separator />

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }
</style>
