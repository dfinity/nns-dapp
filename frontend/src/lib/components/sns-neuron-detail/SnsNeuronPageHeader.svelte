<script lang="ts">
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getContext } from "svelte";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import { nonNullish } from "@dfinity/utils";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import PageHeader from "../common/PageHeader.svelte";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;
</script>

<PageHeader testId="sns-neuron-page-header-component">
  <UniversePageSummary slot="start" universe={$selectedUniverseStore} />
  <span slot="end" class="description header-end">
    {#if nonNullish(neuron)}
      <IdentifierHash identifier={getSnsNeuronIdAsHexString(neuron)} />
    {/if}
  </span>
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>
