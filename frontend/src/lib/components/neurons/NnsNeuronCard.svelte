<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import type { CardType } from "$lib/types/card";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NeuronCardContainer from "./NeuronCardContainer.svelte";
  import NeuronStateInfo from "./NeuronStateInfo.svelte";
  import NnsNeuronCardTitle from "./NnsNeuronCardTitle.svelte";
  import NnsNeuronRemainingTime from "./NnsNeuronRemainingTime.svelte";
  import NnsNeuronAmount from "./NnsNeuronAmount.svelte";

  export let neuron: NeuronInfo;
  export let proposerNeuron = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected = false;
  export let disabled = false;
  export let cardType: CardType = "card";
</script>

<TestIdWrapper testId="nns-neuron-card-component">
  <NeuronCardContainer
    {role}
    {selected}
    {disabled}
    {ariaLabel}
    on:click
    {cardType}
  >
    <NnsNeuronCardTitle {neuron} slot="start" />

    <div class:disabled class="content">
      <NnsNeuronAmount {neuron} {proposerNeuron} />

      <NeuronStateInfo state={neuron.state} />
    </div>

    <NnsNeuronRemainingTime {neuron} />

    <slot />
  </NeuronCardContainer>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "../../themes/mixins/neuron";

  // TODO: avoid root global styling
  :global(div.modal article > div) {
    margin-bottom: 0;
  }

  .disabled {
    --amount-color: rgba(var(--disable-contrast-rgb), 0.8);
  }

  .content {
    @include neuron.neuron-card-content;
  }
</style>
