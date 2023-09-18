<script lang="ts">
  import { hasEnoughMaturityToStakeOrDisburse } from "$lib/utils/sns-neuron.utils";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";

  export let neuron: SnsNeuron;

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStakeOrDisburse(neuron);

  const showModal = () => openSnsNeuronModal({ type: "stake-maturity" });
</script>

<StakeMaturityButton {enoughMaturity} on:click={showModal} />
