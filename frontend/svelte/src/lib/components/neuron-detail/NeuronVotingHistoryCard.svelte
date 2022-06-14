<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Ballots from "./Ballots/Ballots.svelte";
  import CardStatic from "../ui/CardStatic.svelte";

  export let neuron: NeuronInfo;
</script>

<CardStatic>
  <h3>{$i18n.neuron_detail.voting_history}</h3>
  <Ballots {neuron} />
</CardStatic>
