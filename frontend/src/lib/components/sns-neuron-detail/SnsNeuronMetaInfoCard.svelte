<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { secondsToDate } from "../../utils/date.utils";
  import Value from "../ui/Value.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronCard from "../sns-neurons/SnsNeuronCard.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "../../types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import DisburseButton from "../neuron-detail/actions/DisburseButton.svelte";
  import DisburseSnsNeuronModal from "../../modals/neurons/DisburseSnsNeuronModal.svelte";
  import {
    getSnsNeuronState,
    hasPermissionToDisburse,
  } from "../../utils/sns-neuron.utils";
  import { authStore } from "../../stores/auth.store";
  import { isNullish, nonNullish } from "../../utils/utils";
  import { NeuronState } from "@dfinity/nns";
  import DissolveSnsNeuronButton from "./actions/DissolveSnsNeuronButton.svelte";

  const { store }: SelectedSnsNeuronContext =
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

  const { reload: reloadContext } = getContext<SelectedSnsNeuronContext>(
    SELECTED_SNS_NEURON_CONTEXT_KEY
  );
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
          <DisburseButton
            {neuron}
            modal={DisburseSnsNeuronModal}
            {reloadContext}
          />
        {:else if neuronState === NeuronState.Dissolving || neuronState === NeuronState.Locked}
          <DissolveSnsNeuronButton
            neuronId={neuron.id}
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
