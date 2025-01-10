<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import type { CardType } from "$lib/types/card";
  import NeuronCardContainer from "$lib/components/neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import NnsNeuronAmount from "$lib/components/neurons/NnsNeuronAmount.svelte";
  import NnsNeuronCardTitle from "$lib/components/neurons/NnsNeuronCardTitle.svelte";
  import NnsNeuronRemainingTime from "$lib/components/neurons/NnsNeuronRemainingTime.svelte";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
  export let proposerNeuron = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected = false;
  export let disabled = false;
  export let cardType: CardType = "card";
  export let href: string | undefined = undefined;
</script>

<TestIdWrapper testId="nns-neuron-card-component">
  <NeuronCardContainer
    {role}
    {selected}
    {disabled}
    {ariaLabel}
    on:click
    {href}
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
