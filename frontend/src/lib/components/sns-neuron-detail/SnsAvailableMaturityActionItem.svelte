<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { formattedMaturity } from "$lib/utils/sns-neuron.utils";
  import SnsStakeMaturityButton from "./actions/SnsStakeMaturityButton.svelte";

  export let neuron: SnsNeuron;
</script>

<CommonItemAction testId="sns-available-maturity-item-action-component">
  <IconExpandCircleDown slot="icon" />
  <span slot="title" data-tid="available-maturity"
    >{formattedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}</svelte:fragment
  >
  <SnsStakeMaturityButton variant="secondary" />
</CommonItemAction>
