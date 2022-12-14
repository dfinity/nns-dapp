<script lang="ts">
  import Footer from "$lib/components/common/Footer.svelte";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SnsStakeNeuronModal from "$lib/modals/sns/neurons/SnsStakeNeuronModal.svelte";
  import { snsSelectedProjectNewTxData } from "$lib/derived/selected-project-new-tx-data.derived";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";

  type ModalKey = "stake-neuron";
  let showModal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (showModal = key);
  const closeModal = () => (showModal = undefined);
</script>

<Footer columns={1}>
  <button
    data-tid="stake-sns-neuron-button"
    class="primary full-width"
    on:click={() => openModal("stake-neuron")}
    >{$i18n.neurons.stake_neurons}</button
  >
</Footer>

{#if showModal === "stake-neuron"}
  {#if $snsSelectedProjectNewTxData !== undefined && $snsProjectSelectedStore !== undefined}
    <SnsStakeNeuronModal
      token={$snsSelectedProjectNewTxData.token}
      on:nnsClose={closeModal}
      rootCanisterId={$snsSelectedProjectNewTxData.rootCanisterId}
      transactionFee={$snsSelectedProjectNewTxData.transactionFee}
      governanceCanisterId={$snsProjectSelectedStore.summary
        .governanceCanisterId}
    />
  {:else}
    <!-- A toast error is shown if there is an error fetching any of the needed data -->
    <Modal on:nnsClose>
      <svelte:fragment slot="title"
        >{$i18n.neurons.stake_neuron}</svelte:fragment
      ><Spinner /></Modal
    >
  {/if}
{/if}
