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
  import { NeuronState } from "@dfinity/nns";
  import DissolveSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/DissolveSnsNeuronButton.svelte";
  import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
  import IncreaseSnsDissolveDelayButton from "$lib/components/sns-neuron-detail/actions/IncreaseSnsDissolveDelayButton.svelte";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

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
    {#if allowedToDissolve && ENABLE_SNS}
      <IncreaseSnsDissolveDelayButton />
    {/if}
    {#if neuronState === NeuronState.Dissolved && allowedToDisburse}
      <DisburseSnsButton />
    {:else if canDissolve}
      <DissolveSnsNeuronButton {neuronState} />
    {/if}
  </div>

  <Separator />
{/if}

<style lang="scss">
  @use "../../themes/mixins/section";

  .buttons {
    @include section.actions;
  }
</style>
