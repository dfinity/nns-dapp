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
  import { neuronsStore, sortedNeuronStore } from "../lib/stores/neurons.store";
  import { routeStore } from "../lib/stores/route.store";
  import {
    AppPath,
    SHOW_NEURONS_ROUTE,
  } from "../lib/constants/routes.constants";
  import MergeNeuronsModal from "../lib/modals/neurons/MergeNeuronsModal.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { MAX_NEURONS_MERGED } from "../lib/constants/neurons.constants";
  import Tooltip from "../lib/components/ui/Tooltip.svelte";

  let isLoading: boolean = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(async () => {
    // TODO: To be removed once this page has been implemented
    if (!SHOW_NEURONS_ROUTE) {
      window.location.replace("/#/neurons");
    }
  });

  let principalText: string = "";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ identity }: AuthStore) =>
      (principalText = identity?.getPrincipal().toText() ?? "")
  );

  onDestroy(unsubscribe);

  type ModalKey = "stake-neuron" | "merge-neurons";
  let showModal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (showModal = key);
  const closeModal = () => (showModal = undefined);

  const goToNeuronDetails = (id: NeuronId) => () => {
    routeStore.navigate({
      path: `${AppPath.NeuronDetail}/${id}`,
    });
  };

  let enoughNeuronsToMerge: boolean;
  $: enoughNeuronsToMerge = $sortedNeuronStore.length >= MAX_NEURONS_MERGED;
</script>

{#if SHOW_NEURONS_ROUTE}
  <Layout>
    <svelte:fragment slot="header">{$i18n.navigation.neurons}</svelte:fragment>
    <section data-tid="neurons-body">
      <p>{$i18n.neurons.text}</p>

      <p>
        {$i18n.neurons.principal_is}
        {principalText}
      </p>

      {#if isLoading}
        <SkeletonCard />
        <SkeletonCard />
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
          class="primary full-width"
          on:click={() => openModal("stake-neuron")}
          >{$i18n.neurons.stake_neurons}</button
        >
        {#if enoughNeuronsToMerge}
          <button
            data-tid="merge-neurons-button"
            class="primary full-width"
            on:click={() => openModal("merge-neurons")}
            >{$i18n.neurons.merge_neurons}</button
          >
        {:else}
          <Tooltip
            id="merge-neurons-info"
            text={$i18n.neurons.need_two_to_merge}
          >
            <button
              disabled
              data-tid="merge-neurons-button"
              class="primary full-width"
              on:click={() => openModal("merge-neurons")}
              >{$i18n.neurons.merge_neurons}</button
            >
          </Tooltip>
        {/if}
      </Toolbar>
    </svelte:fragment>
    {#if showModal === "stake-neuron"}
      <CreateNeuronModal on:nnsClose={closeModal} />
    {/if}
    {#if showModal === "merge-neurons"}
      <MergeNeuronsModal on:nnsClose={closeModal} />
    {/if}
  </Layout>
{/if}

<style lang="scss">
  p:last-of-type {
    margin-bottom: var(--padding-3x);
  }
</style>
