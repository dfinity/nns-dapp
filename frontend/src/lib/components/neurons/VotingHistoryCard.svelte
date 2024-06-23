<script lang="ts">
  import Ballots from "$lib/components/neuron-detail/Ballots/Ballots.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Card } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
</script>

<Card>
  <h3 slot="start">{$i18n.neuron_detail.voting_history}</h3>
  <Ballots {neuron} />
</Card>
