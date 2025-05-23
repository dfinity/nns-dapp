<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { MAX_NEURONS_MERGED } from "$lib/constants/neurons.constants";
  import MergeNeuronsModal from "$lib/modals/neurons/MergeNeuronsModal.svelte";
  import NnsStakeNeuronModal from "$lib/modals/neurons/NnsStakeNeuronModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { sortedNeuronStore } from "$lib/derived/neurons.derived";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { Tooltip } from "@dfinity/gix-components";

  type ModalKey = "stake-neuron" | "merge-neurons";
  let showModal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (showModal = key);
  const closeModal = () => (showModal = undefined);

  let votingInProgress = false;
  $: votingInProgress =
    ($voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []).length >
    0;
  let enoughNeuronsToMerge: boolean;
  $: enoughNeuronsToMerge = $sortedNeuronStore.length >= MAX_NEURONS_MERGED;
</script>

<TestIdWrapper testId="nns-neurons-footer-component">
  <Footer>
    <button
      data-tid="stake-neuron-button"
      class="primary full-width"
      on:click={() => openModal("stake-neuron")}
      >{$i18n.neurons.stake_icp}</button
    >
    {#if enoughNeuronsToMerge}
      <button
        disabled={votingInProgress}
        data-tid="merge-neurons-button"
        class="secondary full-width"
        on:click={() => openModal("merge-neurons")}
        >{$i18n.neurons.merge_neurons}</button
      >
    {:else}
      <Tooltip
        id="merge-neurons-info"
        top
        text={$i18n.neurons.need_two_to_merge}
      >
        <button
          disabled
          data-tid="merge-neurons-button"
          class="secondary full-width tooltip-button"
          on:click={() => openModal("merge-neurons")}
          >{$i18n.neurons.merge_neurons}</button
        >
      </Tooltip>
    {/if}
  </Footer>

  {#if showModal === "stake-neuron"}
    <NnsStakeNeuronModal on:nnsClose={closeModal} />
  {/if}
  {#if showModal === "merge-neurons"}
    <MergeNeuronsModal on:nnsClose={closeModal} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  // TODO: do not use :global root this can affects other components
  :global(footer .tooltip-wrapper) {
    --tooltip-width: 50%;
  }

  .tooltip-button {
    width: 100%;
  }
</style>
