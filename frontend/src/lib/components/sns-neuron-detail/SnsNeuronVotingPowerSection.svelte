<script lang="ts">
  import { Section } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { snsNeuronVotingPower } from "$lib/utils/sns-neuron.utils";
  import { nonNullish, type Token } from "@dfinity/utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import SnsStakeItemAction from "./SnsStakeItemAction.svelte";
  import type { Universe } from "$lib/types/universe";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";

  export let parameters: SnsNervousSystemParameters;
  export let token: Token;

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let universe: Universe;
  $: universe = $selectedUniverseStore;
</script>

<Section testId="sns-neuron-voting-power-section-component">
  <h3 slot="title">{$i18n.neurons.voting_power}</h3>
  <p slot="end" class="title-value" data-tid="voting-power">
    {#if nonNullish(neuron)}
      {formatVotingPower(
        snsNeuronVotingPower({ neuron, snsParameters: parameters })
      )}
    {/if}
  </p>
  <p slot="description">
    {replacePlaceholders($i18n.neuron_detail.voting_power_section_description, {
      $token: token.symbol,
    })}
  </p>
  <ul class="content">
    {#if nonNullish(neuron)}
      <SnsStakeItemAction {neuron} {token} {universe} />
    {/if}
  </ul>
</Section>

<style lang="scss">
  h3,
  p {
    margin: 0;
  }

  .title-value {
    font-size: var(--font-size-h3);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);

    padding: 0;
  }
</style>
