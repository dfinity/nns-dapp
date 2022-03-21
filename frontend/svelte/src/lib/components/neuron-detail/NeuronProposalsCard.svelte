<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";

  export let neuron: NeuronInfo;
</script>

<Card>
  <!-- TODO: https://dfinity.atlassian.net/browse/L2-355 -->
  Proposals Card {neuron.neuronId}
</Card>
