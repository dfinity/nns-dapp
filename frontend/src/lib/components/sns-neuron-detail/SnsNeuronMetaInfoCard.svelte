<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDate } from "$lib/utils/date.utils";
  import Value from "$lib/components/ui/Value.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronCard from "../sns-neurons/SnsNeuronCard.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import {
    getSnsNeuronState,
    hasPermissionToDisburse,
  } from "$lib/utils/sns-neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { NeuronState } from "@dfinity/nns";
  import DissolveSnsNeuronButton from "$lib/actions/DissolveSnsNeuronButton.svelte";
  import { fromDefinedNullable } from "@dfinity/utils";
  import DisburseSnsButton from "$lib/components/neuron-detail/actions/DisburseSnsButton.svelte";

  const { store, reload: reloadContext }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  let allowedToDisburse: boolean;
  $: allowedToDisburse = isNullish(neuron)
    ? false
    : hasPermissionToDisburse({
        neuron,
        identity: $authStore.identity,
      });
</script>

{#if nonNullish(neuron)}
  <SnsNeuronCard {neuron} cardType="info">
    <section>
      <p>
        <Value>{secondsToDate(Number(neuron.created_timestamp_seconds))}</Value>
        - {$i18n.neurons.staked}
      </p>

      <div class="buttons">
        {#if neuronState === NeuronState.Dissolved && allowedToDisburse}
          <DisburseSnsButton {neuron} {reloadContext} />
        {:else if neuronState === NeuronState.Dissolving || neuronState === NeuronState.Locked}
          <DissolveSnsNeuronButton
            neuronId={fromDefinedNullable(neuron.id)}
            {neuronState}
            {reloadContext}
          />
        {/if}
      </div>
    </section>
  </SnsNeuronCard>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  section {
    padding: var(--padding) 0 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
