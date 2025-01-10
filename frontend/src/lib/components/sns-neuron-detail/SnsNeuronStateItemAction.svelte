<script lang="ts">
  import AgeBonusText from "$lib/components/neuron-detail/AgeBonusText.svelte";
  import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
  import DissolveSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/DissolveSnsNeuronButton.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { getStateInfo, type StateInfo } from "$lib/utils/neuron.utils";
  import {
    ageMultiplier,
    getSnsNeuronState,
    hasPermissionToDisburse,
    hasPermissionToDissolve,
  } from "$lib/utils/sns-neuron.utils";
  import { keyOf } from "$lib/utils/utils";
  import { NeuronState } from "@dfinity/nns";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let snsParameters: SnsNervousSystemParameters;
  export let token: Token;

  let state: NeuronState;
  $: state = getSnsNeuronState(neuron);

  let stateInfo: StateInfo;
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

<CommonItemAction
  testId="sns-neuron-state-item-action-component"
  tooltipText={replacePlaceholders($i18n.neuron_detail.neuron_state_tooltip, {
    $token: token.symbol,
  })}
  tooltipId="sns-neuron-state-info-icon"
>
  <svelte:fragment slot="icon">
    {#if stateInfo?.Icon !== undefined}
      <svelte:component this={stateInfo.Icon} />
    {/if}
  </svelte:fragment>
  <span slot="title" data-tid="state-text">
    {keyOf({ obj: $i18n.neuron_state, key: stateInfo.textKey })}
  </span>
  <svelte:fragment slot="subtitle">
    {#if state === NeuronState.Locked}
      <AgeBonusText ageMultiplier={ageBonus} />
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
