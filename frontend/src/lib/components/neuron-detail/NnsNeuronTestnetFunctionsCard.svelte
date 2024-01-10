<script lang="ts">
  import CardInfo from "../ui/CardInfo.svelte";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  const openAddMaturityModal = async () => {
    openNnsNeuronModal({ type: "dev-add-maturity", data: { neuron } });
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<CardInfo>
  <h3 slot="start">Neuron TESTNET ONLY</h3>

  <div>
    <button on:click={openAddMaturityModal} class="primary">Add Maturity</button
    >
  </div>
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
