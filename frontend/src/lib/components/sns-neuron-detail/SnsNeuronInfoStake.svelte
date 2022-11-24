<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronAmount from "$lib/components/sns-neurons/SnsNeuronAmount.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import {
    getSnsNeuronState,
    hasPermissionToDisburse,
    hasPermissionToDissolve,
  } from "$lib/utils/sns-neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { NeuronState, type Token } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import DissolveSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/DissolveSnsNeuronButton.svelte";
  import { fromDefinedNullable } from "@dfinity/utils";
  import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
  import IncreaseSnsDissolveDelayButton from "$lib/components/sns-neuron-detail/actions/IncreaseSnsDissolveDelayButton.svelte";
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";

  const { store, reload: reloadContext }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore as Token;

  let allowedToDissolve: boolean;
  $: allowedToDissolve = isNullish(neuron)
    ? false
    : hasPermissionToDissolve({
        neuron,
        identity: $authStore.identity,
      });

  let allowedToDisburse: boolean;
  $: allowedToDisburse = isNullish(neuron)
    ? false
    : hasPermissionToDisburse({
        neuron,
        identity: $authStore.identity,
      });

  let canDissolve = false;
  $: canDissolve =
    nonNullish(neuronState) &&
    [NeuronState.Dissolving, NeuronState.Locked].includes(neuronState) &&
    allowedToDissolve;
</script>

{#if nonNullish(neuron) && nonNullish(neuronState)}
  <KeyValuePair>
    <h3 slot="key">{$i18n.neuron_detail.stake}</h3>
    <SnsNeuronAmount {neuron} slot="value" />
  </KeyValuePair>

  <div class="buttons">
    {#if allowedToDissolve && ENABLE_SNS_2}
      <!-- TODO: Enable when voting power calculation is accurate -->
      <IncreaseSnsDissolveDelayButton
        {neuron}
        {token}
        reloadNeuron={reloadContext}
      />
    {/if}
    {#if neuronState === NeuronState.Dissolved && allowedToDisburse}
      <DisburseSnsButton {neuron} {reloadContext} />
    {:else if canDissolve}
      <DissolveSnsNeuronButton
        neuronId={fromDefinedNullable(neuron.id)}
        {neuronState}
        {reloadContext}
      />
    {/if}
  </div>

  <Separator />
{/if}

<style lang="scss">
  .buttons {
    display: flex;
    gap: var(--padding);
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin: var(--padding-2x) 0 0;
  }
</style>
