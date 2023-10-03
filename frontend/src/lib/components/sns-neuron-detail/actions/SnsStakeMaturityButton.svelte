<script lang="ts">
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
  import { hasEnoughMaturityToStake } from "$lib/utils/sns-neuron.utils";

  export let neuron: SnsNeuron;

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStake(neuron);

  const showModal = () => openSnsNeuronModal({ type: "stake-maturity" });
</script>

<StakeMaturityButton {enoughMaturity} on:click={showModal} />
