<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import { getStateInfo, type StateInfo } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    ageMultiplier,
    getSnsNeuronState,
    hasPermissionToDisburse,
    hasPermissionToDissolve,
  } from "$lib/utils/sns-neuron.utils";
  import DisburseSnsButton from "./actions/DisburseSnsButton.svelte";
  import DissolveSnsNeuronButton from "./actions/DissolveSnsNeuronButton.svelte";
  import { authStore } from "$lib/stores/auth.store";

  export let neuron: SnsNeuron;
  export let snsParameters: SnsNervousSystemParameters;

  let state: NeuronState;
  $: state = getSnsNeuronState(neuron);

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(state);

  let ageBonus: number;
  $: ageBonus = ageMultiplier({ neuron, snsParameters });

  let allowedToDisburse: boolean;
  $: allowedToDisburse =
    state === NeuronState.Dissolved &&
    hasPermissionToDisburse({
      neuron,
      identity: $authStore.identity,
    });

  let allowedToDissolve = false;
  $: allowedToDissolve =
    [NeuronState.Dissolving, NeuronState.Locked].includes(state) &&
    hasPermissionToDissolve({
      neuron,
      identity: $authStore.identity,
    });
</script>

<CommonItemAction testId="sns-neuron-state-item-action-component">
  <svelte:fragment slot="icon">
    {#if stateInfo?.Icon !== undefined}
      <svelte:component this={stateInfo.Icon} />
    {/if}
  </svelte:fragment>
  <span slot="title" data-tid="state-text">
    {keyOf({ obj: $i18n.neuron_state, key: NeuronState[state] })}
  </span>
  <svelte:fragment slot="subtitle">
    {#if state === NeuronState.Locked}
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
  {#if allowedToDisburse}
    <DisburseSnsButton {neuron} />
  {:else if allowedToDissolve}
    <DissolveSnsNeuronButton {neuron} />
  {/if}
</CommonItemAction>
