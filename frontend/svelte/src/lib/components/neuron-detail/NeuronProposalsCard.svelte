<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { makeDummyProposals } from "../../services/neurons.services";
  import Card from "../ui/Card.svelte";

  export let neuron: NeuronInfo;

  const makeProposals = () => {
    makeDummyProposals(neuron.neuronId);
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<Card>
  <h3 slot="start">Proposals</h3>

  <div>
    <button on:click={makeProposals} class="primary small"
      >Make Dummy Proposal</button
    >
  </div>
</Card>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
  }
</style>
