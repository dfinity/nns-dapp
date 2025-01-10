<script lang="ts">
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { i18n } from "$lib/stores/i18n";
  import Ballots from "$lib/components/neuron-detail/Ballots/Ballots.svelte";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
</script>

<CardInfo noMargin>
  <h3>{$i18n.neuron_detail.voting_history}</h3>
  <Ballots {neuron} />
</CardInfo>
