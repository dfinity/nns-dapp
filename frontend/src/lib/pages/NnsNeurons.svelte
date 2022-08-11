<script lang="ts">
  import Footer from "../components/common/Footer.svelte";
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "../stores/auth.store";
  import type { AuthStore } from "../stores/auth.store";
  import { i18n } from "../stores/i18n";
  import Toolbar from "../components/ui/Toolbar.svelte";
  import NeuronCard from "../components/neurons/NeuronCard.svelte";
  import CreateNeuronModal from "../modals/neurons/CreateNeuronModal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { neuronsStore, sortedNeuronStore } from "../stores/neurons.store";
  import { routeStore } from "../stores/route.store";
  import { AppPath } from "../constants/routes.constants";
  import MergeNeuronsModal from "../modals/neurons/MergeNeuronsModal.svelte";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import { MAX_NEURONS_MERGED } from "../constants/neurons.constants";
  import Tooltip from "../components/ui/Tooltip.svelte";
  import { isSpawning } from "../utils/neuron.utils";
  import Value from "../components/ui/Value.svelte";
  import { voteInProgressStore } from "../stores/voting.store";

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

  const goToNeuronDetails = (id: NeuronId) => () => {
    routeStore.navigate({
      path: `${AppPath.NeuronDetail}/${id}`,
    });
  };

  let votingInProgress: boolean = false;
  $: votingInProgress = $voteInProgressStore.votes.length > 0;

  let enoughNeuronsToMerge: boolean;
  $: enoughNeuronsToMerge = $sortedNeuronStore.length >= MAX_NEURONS_MERGED;
</script>

<section data-tid="neurons-body">
  <p class="description">{$i18n.neurons.text}</p>

  <p class="description">
    {$i18n.neurons.principal_is}
    <Value>{principalText}</Value>
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
            {neuron}
          />
        </Tooltip>
      {:else}
        <NeuronCard
          role="link"
          ariaLabel={$i18n.neurons.aria_label_neuron_card}
          on:click={goToNeuronDetails(neuron.neuronId)}
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
        disabled={votingInProgress}
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
