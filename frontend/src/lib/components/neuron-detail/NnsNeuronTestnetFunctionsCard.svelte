<script lang="ts">
  import { unlockNeuron } from "$lib/services/nns-neurons-dev.services";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let unlocking = false;

  const unlock = async () => {
    try {
      unlocking = true;
      await unlockNeuron(neuron);
    } finally {
      unlocking = false;
    }
  };

  const openAddMaturityModal = async () => {
    openNnsNeuronModal({ type: "dev-add-maturity", data: { neuron } });
  };
  const openUpdateVotingPowerRefreshedModal = async () => {
    openNnsNeuronModal({
      type: "dev-update-voting-power-refreshed",
      data: { neuron },
    });
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<CardInfo testId="nns-neuron-testnet-functions-card-component">
  <h3 slot="start">Neuron TESTNET ONLY</h3>

  <div class="functions">
    <button on:click={unlock} class="primary" data-tid="unlock-neuron-button">
      {#if unlocking}
        <Spinner inline size="small" />
      {/if}
      Unlock neuron</button
    >

    <button
      on:click={openAddMaturityModal}
      class="primary"
      data-tid="add-maturity-button">Add Maturity</button
    >

    <button
      on:click={openUpdateVotingPowerRefreshedModal}
      class="primary"
      data-tid="update-voting-power-refreshed-button"
      >Update Voting Power Refreshed Timestamp</button
    >
  </div>
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .functions {
    display: flex;
    justify-content: flex-start;
    gap: var(--padding-2x);
  }
</style>
