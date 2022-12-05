<script lang="ts">
  import {
    hasEnoughMaturityToStake,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
  import { isNullish } from "$lib/utils/utils";
  import { authStore } from "$lib/stores/auth.store";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store }: SelectedSnsNeuronContext = context;

  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron } = $store);

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStake(neuron);

  const showModal = () => openSnsNeuronModal({ type: "stake-maturity" });

  let allowedToStakeMaturity: boolean;
  $: allowedToStakeMaturity = isNullish(neuron)
    ? false
    : hasPermissionToStakeMaturity({
        neuron,
        identity: $authStore.identity,
      });
</script>

{#if allowedToStakeMaturity}
  <StakeMaturityButton {enoughMaturity} on:click={showModal} />
{/if}
