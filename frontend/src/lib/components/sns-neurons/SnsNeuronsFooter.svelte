<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import SnsStakeNeuronModal from "$lib/modals/sns/neurons/SnsStakeNeuronModal.svelte";
  import { snsSelectedProjectNewTxData } from "$lib/derived/sns/sns-selected-project-new-tx-data.derived";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";

  type ModalKey = "stake-neuron";
  let showModal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (showModal = key);
  const closeModal = () => (showModal = undefined);
</script>

<TestIdWrapper testId="sns-neurons-footer-component">
  {#if nonNullish($snsTokenSymbolSelectedStore)}
    <Footer columns={1}>
      <button
        data-tid="stake-sns-neuron-button"
        class="primary full-width"
        on:click={() => openModal("stake-neuron")}
        >{replacePlaceholders($i18n.neurons.stake_token, {
          $token: $snsTokenSymbolSelectedStore.symbol,
        })}</button
      >
    </Footer>
  {/if}

  {#if showModal === "stake-neuron"}
    {#if $snsSelectedProjectNewTxData !== undefined && $snsProjectSelectedStore !== undefined}
      <SnsStakeNeuronModal
        token={$snsSelectedProjectNewTxData.token}
        on:nnsClose={closeModal}
        rootCanisterId={$snsSelectedProjectNewTxData.rootCanisterId}
        transactionFee={toTokenAmountV2(
          $snsSelectedProjectNewTxData.transactionFee
        )}
        governanceCanisterId={$snsProjectSelectedStore.summary
          .governanceCanisterId}
      />
    {:else}
      <!-- A toast error is shown if there is an error fetching any of the needed data -->
      <!-- TODO: replace with busy spinner pattern as in <SnsIncreateStakeNeuronModal /> -->
      {#if nonNullish($snsTokenSymbolSelectedStore)}
        <Modal on:nnsClose>
          <svelte:fragment slot="title"
            >{replacePlaceholders($i18n.neurons.stake_token, {
              $token: $snsTokenSymbolSelectedStore.symbol,
            })}</svelte:fragment
          ><Spinner /></Modal
        >
      {/if}
    {/if}
  {/if}
</TestIdWrapper>
