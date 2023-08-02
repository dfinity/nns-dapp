<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formattedStakedMaturity } from "$lib/utils/neuron.utils";
  import { IconStakedMaturity } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import CommonItemAction from "../ui/CommonItemAction.svelte";

  export let neuron: NeuronInfo;
</script>

<CommonItemAction testId="nns-staked-maturity-item-action-component">
  <IconStakedMaturity slot="icon" />
  <span slot="title" data-tid="staked-maturity"
    >{formattedStakedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.staked_description}</svelte:fragment
  >
</CommonItemAction>
