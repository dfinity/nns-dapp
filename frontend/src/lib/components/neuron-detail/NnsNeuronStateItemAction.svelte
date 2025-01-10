<script lang="ts">
  import AgeBonusText from "$lib/components/neuron-detail/AgeBonusText.svelte";
  import DisburseButton from "$lib/components/neuron-detail/actions/DisburseButton.svelte";
  import DissolveActionButton from "$lib/components/neuron-detail/actions/DissolveActionButton.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    ageMultiplier,
    getStateInfo,
    isNeuronControllable,
    type StateInfo,
  } from "$lib/utils/neuron.utils";
  import { keyOf } from "$lib/utils/utils";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let stateInfo: StateInfo;
  $: stateInfo = getStateInfo(neuron.state);

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });
</script>

<CommonItemAction
  testId="nns-neuron-state-item-action-component"
  tooltipText={replacePlaceholders($i18n.neuron_detail.neuron_state_tooltip, {
    $token: ICPToken.symbol,
  })}
  tooltipId="neuron-state-info-icon"
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
    {#if neuron.state === NeuronState.Locked}
      <AgeBonusText ageMultiplier={ageMultiplier(neuron.ageSeconds)} />
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
