<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "../lib/stores/auth.store";
  import type { AuthStore } from "../lib/stores/auth.store";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import NeuronCard from "../lib/components/neurons/NeuronCard.svelte";
  import CreateNeuronModal from "../lib/modals/neurons/CreateNeuronModal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { listNeurons } from "../lib/services/neurons.services";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { sortedNeuronStore } from "../lib/stores/neurons.store";
  import { routeStore } from "../lib/stores/route.store";
  import {
    AppPath,
    SHOW_NEURONS_ROUTE,
  } from "../lib/constants/routes.constants";
  import MergeNeuronsModal from "../lib/modals/neurons/MergeNeuronsModal.svelte";

  let isLoading: boolean = false;
  // TODO: To be removed once this page has been implemented
  onMount(async () => {
    if (!SHOW_NEURONS_ROUTE) {
      window.location.replace("/#/neurons");
    }
    isLoading = true;
    await listNeurons();
    isLoading = false;
  });

  let principalText: string = "";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ identity }: AuthStore) =>
      (principalText = identity?.getPrincipal().toText() ?? "")
  );

  onDestroy(unsubscribe);

  let showStakeNeuronModal: boolean = false;
  const openStakeNeuron = () => (showStakeNeuronModal = true);
  const closeStakeNeuron = () => (showStakeNeuronModal = false);

  let showMergeNeuronsModal: boolean = false;
  const openMergeNeurons = () => (showMergeNeuronsModal = true);
  const closeMergeNeurons = () => (showMergeNeuronsModal = false);

  const goToNeuronDetails = (id: NeuronId) => () => {
    routeStore.navigate({
      path: `${AppPath.NeuronDetail}/${id}`,
    });
  };
</script>

{#if SHOW_NEURONS_ROUTE}
  <Layout>
    <section data-tid="neurons-body">
      <p>{$i18n.neurons.text}</p>

      <p>
        {$i18n.neurons.principal_is}
        {principalText}
      </p>

      {#if isLoading}
        <Spinner />
      {:else}
        {#each $sortedNeuronStore as neuron}
          <NeuronCard
            role="link"
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            on:click={goToNeuronDetails(neuron.neuronId)}
            {neuron}
          />
        {/each}
      {/if}
    </section>
    <svelte:fragment slot="footer">
      <Toolbar>
        <button
          data-tid="stake-neuron-button"
          class="primary"
          on:click={openStakeNeuron}>{$i18n.neurons.stake_neurons}</button
        >
        <button
          data-tid="merge-neurons-button"
          class="primary"
          on:click={openMergeNeurons}>{$i18n.neurons.merge_neurons}</button
        >
      </Toolbar>
    </svelte:fragment>
    {#if showStakeNeuronModal}
      <CreateNeuronModal on:nnsClose={closeStakeNeuron} />
    {/if}
    {#if showMergeNeuronsModal}
      <MergeNeuronsModal on:nnsClose={closeMergeNeurons} />
    {/if}
  </Layout>
{/if}

<style lang="scss">
  p:last-of-type {
    margin-bottom: var(--padding-3x);
  }
</style>
