<script lang="ts">
  import type { NeuronState } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { CardType } from "$lib/types/card";
  import { getSnsNeuronState } from "$lib/utils/sns-neuron.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NeuronCardContainer from "$lib/components/neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import SnsNeuronCardTitle from "$lib/components/sns-neurons/SnsNeuronCardTitle.svelte";
  import SnsNeuronAmount from "$lib/components/sns-neurons/SnsNeuronAmount.svelte";
  import SnsNeuronStateRemainingTime from "$lib/components/sns-neurons/SnsNeuronStateRemainingTime.svelte";

  export let neuron: SnsNeuron;
  export let cardType: CardType = "card";
  export let ariaLabel: string | undefined = undefined;
  export let href: string | undefined = undefined;

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);
</script>

<TestIdWrapper testId="sns-neuron-card-component">
  <NeuronCardContainer on:click {href} {cardType} {ariaLabel}>
    <SnsNeuronCardTitle slot="start" {neuron} tagName="p" />

    <div class="content">
      <SnsNeuronAmount {neuron} />

      <NeuronStateInfo state={neuronState} />
    </div>

    <SnsNeuronStateRemainingTime {neuron} />

    <slot />
  </NeuronCardContainer>
</TestIdWrapper>

<style lang="scss">
  @use "../../themes/mixins/neuron";

  .content {
    @include neuron.neuron-card-content;
  }
</style>
