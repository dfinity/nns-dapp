<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Ballots from "./Ballots/Ballots.svelte";
  import CardInfo from "../ui/CardInfo.svelte";

  export let neuron: NeuronInfo;
</script>

<CardInfo>
  <h3>{$i18n.neuron_detail.voting_history}</h3>
  <Ballots {neuron} />
</CardInfo>
