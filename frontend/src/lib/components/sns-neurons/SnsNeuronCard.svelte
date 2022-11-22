<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { CardType } from "$lib/types/card";
  import { getSnsNeuronState } from "$lib/utils/sns-neuron.utils";
  import NeuronCardContainer from "$lib/components/neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import SnsNeuronCardTitle from "$lib/components/sns-neurons/SnsNeuronCardTitle.svelte";
  import SnsNeuronAmount from "$lib/components/sns-neurons/SnsNeuronAmount.svelte";
  import SnsNeuronStateRemainingTime from "$lib/components/sns-neurons/SnsNeuronStateRemainingTime.svelte";

  export let neuron: SnsNeuron;
  export let role: "link" | undefined = undefined;
  export let cardType: CardType = "card";
  export let ariaLabel: string | undefined = undefined;

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);
</script>

<NeuronCardContainer on:click {role} {cardType} {ariaLabel}>
  <SnsNeuronCardTitle slot="start" {neuron} />

  <div class="content">
    <SnsNeuronAmount {neuron} />

    <NeuronStateInfo state={neuronState} />
  </div>

  <SnsNeuronStateRemainingTime {neuron} />

  <slot />
</NeuronCardContainer>

<style lang="scss">
  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
  }
</style>
