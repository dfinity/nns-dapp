<script lang="ts">
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import {
    ageMultiplier,
    getStateInfo,
    isNeuronControllable,
    type StateInfo,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import DisburseButton from "./actions/DisburseButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import AgeBonusText from "./AgeBonusText.svelte";

  export let neuron: NeuronInfo;

  let stateInfo: StateInfo;
  $: stateInfo = getStateInfo(neuron.state);

  let ageBonus: number;
  $: ageBonus = ageMultiplier(neuron.ageSeconds);

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });
</script>

<CommonItemAction testId="nns-neuron-state-item-action-component">
  <svelte:fragment slot="icon">
    {#if stateInfo?.Icon !== undefined}
      <svelte:component this={stateInfo.Icon} />
    {/if}
  </svelte:fragment>
  <span slot="title" data-tid="state-text">
    {keyOf({ obj: $i18n.neuron_state, key: stateInfo.textKey })}
  </span>
  <svelte:fragment slot="subtitle">
    {#if neuron.state === NeuronState.Locked}
      <AgeBonusText {ageBonus} />
    {:else}
      <span data-tid="age-bonus-text">
        {$i18n.neuron_detail.no_age_bonus}
      </span>
    {/if}
  </svelte:fragment>
  {#if isControllable}
    {#if neuron.state === NeuronState.Dissolved}
      <DisburseButton />
    {:else}
      <DissolveActionButton neuronState={neuron.state} />
    {/if}
  {/if}
</CommonItemAction>
