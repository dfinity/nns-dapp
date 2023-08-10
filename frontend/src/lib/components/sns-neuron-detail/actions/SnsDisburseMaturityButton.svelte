<script lang="ts">
  import { hasEnoughMaturityToStakeOrDisburse } from "$lib/utils/sns-neuron.utils";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store }: SelectedSnsNeuronContext = context;

  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron } = $store);

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStakeOrDisburse(neuron);

  const showModal = () => openSnsNeuronModal({ type: "disburse-maturity" });
</script>

<TestIdWrapper testId="sns-disburse-maturity-button-component">
  <DisburseMaturityButton {enoughMaturity} on:click={showModal} />
</TestIdWrapper>
