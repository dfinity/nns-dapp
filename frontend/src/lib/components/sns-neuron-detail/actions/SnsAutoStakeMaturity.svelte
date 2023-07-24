<script lang="ts">
  import { getContext } from "svelte";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    hasAutoStakeMaturityOn,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import { isNullish } from "@dfinity/utils";
  import { authStore } from "$lib/stores/auth.store";
  import AutoStakeMaturityCheckbox from "$lib/components/neuron-detail/actions/AutoStakeMaturity.svelte";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store }: SelectedSnsNeuronContext = context;

  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron } = $store);

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  let disabled: boolean;
  $: disabled =
    isNullish(neuron) ||
    !hasPermissionToStakeMaturity({
      neuron,
      identity: $authStore.identity,
    });
</script>

<AutoStakeMaturityCheckbox
  bind:hasAutoStakeOn
  {disabled}
  on:nnsChange={() =>
    openSnsNeuronModal({
      type: "auto-stake-maturity",
    })}
/>
