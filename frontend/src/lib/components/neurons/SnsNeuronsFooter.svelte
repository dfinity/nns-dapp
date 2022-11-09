<script lang="ts">
  import Footer from "$lib/components/common/Footer.svelte";
  import { Modal, Spinner, Toolbar } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import StakeSnsNeuronModal from "$lib/modals/sns/StakeSnsNeuronModal.svelte";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import { snsSelectedProjectNewTxData } from "$lib/derived/selected-project-new-tx-data.derived";
  import { decodeSnsAccount } from "@dfinity/sns";

  type ModalKey = "stake-neuron";
  let showModal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (showModal = key);
  const closeModal = () => (showModal = undefined);
</script>

<Footer>
  <Toolbar>
    <button
      data-tid="stake-sns-neuron-button"
      class="primary full-width"
      on:click={() => openModal("stake-neuron")}
      >{$i18n.neurons.stake_neurons}</button
    >
  </Toolbar>
</Footer>

{#if showModal === "stake-neuron"}
  <!-- TODO: Use governance canister id as destination or the subaccount slot for this neuron -->
  {#if $snsSelectedProjectNewTxData !== undefined && $snsProjectSelectedStore !== undefined}
    <StakeSnsNeuronModal
      token={$snsSelectedProjectNewTxData.token}
      on:nnsClose={closeModal}
      rootCanisterId={$snsSelectedProjectNewTxData.rootCanisterId}
      transactionFee={$snsSelectedProjectNewTxData.transactionFee}
      destination={decodeSnsAccount(
        $snsProjectSelectedStore.summary.rootCanisterId.toText()
      )}
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
