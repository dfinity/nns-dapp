<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import {
    ageMultiplier,
    getStateInfo,
    type StateInfo,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import DisburseButton from "./actions/DisburseButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import CommonItemAction from "../ui/CommonItemAction.svelte";

  export let neuron: NeuronInfo;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(neuron.state);

  let ageBonus: number;
  $: ageBonus = ageMultiplier(neuron.ageSeconds);
</script>

<CommonItemAction testId="nns-neuron-state-item-action-component">
  <svelte:fragment slot="icon">
    {#if stateInfo?.Icon !== undefined}
      <svelte:component this={stateInfo.Icon} />
    {/if}
  </svelte:fragment>
  <span slot="title" data-tid="state-text">
    {keyOf({ obj: $i18n.neuron_state, key: NeuronState[neuron.state] })}
  </span>
  <svelte:fragment slot="subtitle">
    {#if neuron.state === NeuronState.Locked}
      <Tooltip id="neuron-age-bonus" text={ageBonus.toFixed(8)}>
        <span data-tid="age-bonus-text">
          {replacePlaceholders($i18n.neuron_detail.age_bonus_label, {
            $ageBonus: ageBonus.toFixed(2),
          })}
        </span>
      </Tooltip>
    {:else}
      <span data-tid="age-bonus-text">
        {$i18n.neuron_detail.no_age_bonus}
      </span>
    {/if}
  </svelte:fragment>
  {#if neuron.state === NeuronState.Dissolved}
    <DisburseButton />
  {:else}
    <DissolveActionButton neuronState={neuron.state} />
  {/if}
</CommonItemAction>
