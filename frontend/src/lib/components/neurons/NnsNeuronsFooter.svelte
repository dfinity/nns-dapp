<script lang="ts">
  import Footer from "../common/Footer.svelte";
  import { Toolbar } from "@dfinity/gix-components";
  import CreateNeuronModal from "../../modals/neurons/CreateNeuronModal.svelte";
  import MergeNeuronsModal from "../../modals/neurons/MergeNeuronsModal.svelte";
  import { sortedNeuronStore } from "../../stores/neurons.store";
  import { MAX_NEURONS_MERGED } from "../../constants/neurons.constants";
  import { i18n } from "../../stores/i18n";
  import Tooltip from "../ui/Tooltip.svelte";
  import { voteRegistrationStore } from "../../stores/vote-registration.store";

  type ModalKey = "stake-neuron" | "merge-neurons";
  let showModal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (showModal = key);
  const closeModal = () => (showModal = undefined);

  let votingInProgress: boolean = false;
  $: votingInProgress = $voteRegistrationStore.registrations.length > 0;
  let enoughNeuronsToMerge: boolean;
  $: enoughNeuronsToMerge = $sortedNeuronStore.length >= MAX_NEURONS_MERGED;
</script>

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
          class="primary full-width tooltip-button"
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
  // TODO: do not use :global root this can affects other components
  :global(footer .tooltip-wrapper) {
    --tooltip-width: 50%;
  }

  .tooltip-button {
    width: 100%;
  }
</style>
