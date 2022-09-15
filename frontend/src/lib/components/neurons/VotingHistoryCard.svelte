<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { Card } from "@dfinity/gix-components";
  import { i18n } from "../../stores/i18n";
  import Ballots from "../neuron-detail/Ballots/Ballots.svelte";

  export let neuron: NeuronInfo;
</script>

<Card>
  <h3 slot="start">{$i18n.neuron_detail.voting_history}</h3>
  <Ballots {neuron} />
</Card>
