<script lang="ts">
  import { getContext } from "svelte";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import AutoStakeMaturity from "$lib/components/neuron-detail/actions/AutoStakeMaturity.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import type { SnsNeuron } from "@dfinity/sns";
  import { hasAutoStakeMaturityOn } from "$lib/utils/sns-neuron.utils";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store }: SelectedSnsNeuronContext = context;

  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron } = $store);

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);
</script>

<AutoStakeMaturity
  bind:hasAutoStakeOn
  on:nnsChange={() =>
    openSnsNeuronModal({
      type: "auto-stake-maturity",
    })}
/>
