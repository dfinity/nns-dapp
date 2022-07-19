<script lang="ts">
  import Footer from "../lib/components/common/Footer.svelte";
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "../lib/stores/auth.store";
  import type { AuthStore } from "../lib/stores/auth.store";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import NeuronCard from "../lib/components/neurons/NeuronCard.svelte";
  import CreateNeuronModal from "../lib/modals/neurons/CreateNeuronModal.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { neuronsStore, sortedNeuronStore } from "../lib/stores/neurons.store";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import MergeNeuronsModal from "../lib/modals/neurons/MergeNeuronsModal.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { MAX_NEURONS_MERGED } from "../lib/constants/neurons.constants";
  import Tooltip from "../lib/components/ui/Tooltip.svelte";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import { isSpawning } from "../lib/utils/neuron.utils";

  // Neurons are fetch on page load. No need to do it in the route.

  let isLoading: boolean = false;
  $: isLoading = $neuronsStore.neurons === undefined;

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

  const goToNeuronDetails = (neuron: NeuronInfo) => () => {
    // Spawning neuron can't see details yet
    if (!isSpawning(neuron)) {
      routeStore.navigate({
        path: `${AppPath.NeuronDetail}/${neuron.neuronId}`,
      });
    }
  };

  let enoughNeuronsToMerge: boolean;
  $: enoughNeuronsToMerge = $sortedNeuronStore.length >= MAX_NEURONS_MERGED;
</script>

<MainContentWrapper>
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
        {#if isSpawning(neuron)}
          <Tooltip
            id="spawning-neuron-card"
            text={$i18n.neuron_detail.spawning_neuron_info}
          >
            <NeuronCard
              disabled
              ariaLabel={$i18n.neurons.aria_label_neuron_card}
              on:click={goToNeuronDetails(neuron)}
              {neuron}
            />
          </Tooltip>
        {:else}
          <NeuronCard
            role="link"
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            on:click={goToNeuronDetails(neuron)}
            {neuron}
          />
        {/if}
      {/each}
    {/if}
  </section>

  <Footer>
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
        <Tooltip id="merge-neurons-info" text={$i18n.neurons.need_two_to_merge}>
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
  </Footer>

  {#if showModal === "stake-neuron"}
    <CreateNeuronModal on:nnsClose={closeModal} />
  {/if}
  {#if showModal === "merge-neurons"}
    <MergeNeuronsModal on:nnsClose={closeModal} />
  {/if}
</MainContentWrapper>

<style lang="scss">
  p:last-of-type {
    margin-bottom: var(--padding-3x);
  }

  :global(footer .tooltip-wrapper) {
    --tooltip-width: 50%;
  }

  :global(footer .tooltip-wrapper button) {
    width: 100%;
  }
</style>
