<script lang="ts">
  import CardInfo from "../ui/CardInfo.svelte";
  import Separator from "../ui/Separator.svelte";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";

  const openAddMaturityModal = async () => {
    openSnsNeuronModal({ type: "dev-add-maturity" });
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

<Separator />

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
