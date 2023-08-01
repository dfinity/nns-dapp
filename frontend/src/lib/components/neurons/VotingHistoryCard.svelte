<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { Card } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import Ballots from "$lib/components/neuron-detail/Ballots/Ballots.svelte";

  export let neuron: NeuronInfo;
</script>

<Card clickable={false}>
  <h3 slot="start">{$i18n.neuron_detail.voting_history}</h3>
  <Ballots {neuron} />
</Card>
