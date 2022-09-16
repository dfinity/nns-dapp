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
  import { isDissolved } from "../../utils/sns.utils";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  // TODO: TBD
  let isControllable: boolean = true;
</script>

{#if neuron !== undefined && neuron !== null}
  <SnsNeuronCard {neuron} cardType="info">
    <section>
      <p>
        <Value>{secondsToDate(Number(neuron.created_timestamp_seconds))}</Value>
        - {$i18n.neurons.staked}
      </p>

      <div class="buttons">
        {#if isControllable}
          <!-- TODO(GIX-985): Sns/IncreaseDissolveDelayButton -->
          {#if neuron.dissolve_state[0] === undefined || isDissolved(neuron)}
            <DisburseButton {neuron} modal={DisburseSnsNeuronModal} />
          {/if}
          <!-- TODO(GIX-985): Sns/DissolveActionButton -->
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
