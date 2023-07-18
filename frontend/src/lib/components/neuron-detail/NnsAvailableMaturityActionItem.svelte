<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formattedMaturity } from "$lib/utils/neuron.utils";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsStakeMaturityButton from "./actions/NnsStakeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import CommonItemAction from "../ui/CommonItemAction.svelte";

  export let neuron: NeuronInfo;
</script>

<CommonItemAction testId="nns-available-maturity-item-action-component">
  <IconExpandCircleDown slot="icon" />
  <span slot="title" data-tid="available-maturity"
    >{formattedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}</svelte:fragment
  >
  <NnsStakeMaturityButton {neuron} variant="secondary" />
  <SpawnNeuronButton {neuron} />
</CommonItemAction>
