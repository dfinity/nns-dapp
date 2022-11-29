<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronState,
  } from "$lib/utils/sns-neuron.utils";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import type { NeuronState } from "@dfinity/nns";
  import { KeyValuePair } from "@dfinity/gix-components";
  import SnsNeuronCardTitle from "$lib/components/sns-neurons/SnsNeuronCardTitle.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import SnsNeuronAge from "$lib/components/sns-neurons/SnsNeuronAge.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SnsNeuronStateRemainingTime from "$lib/components/sns-neurons/SnsNeuronStateRemainingTime.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    const neuronId = nonNullish(neuron)
      ? getSnsNeuronIdAsHexString(neuron)
      : undefined;

    layoutTitleStore.set(
      intersecting || isNullish(neuronId)
        ? $i18n.neuron_detail.title
        : shortenWithMiddleEllipsis(neuronId)
    );
  };
</script>

{#if nonNullish(neuron) && nonNullish(neuronState)}
  <div class="content-cell-details">
    <KeyValuePair>
      <SnsNeuronCardTitle
        tagName="h3"
        {neuron}
        slot="key"
        on:nnsIntersecting={updateLayoutTitle}
      />
      <NeuronStateInfo state={neuronState} slot="value" />
    </KeyValuePair>

    <SnsNeuronAge {neuron} />

    <SnsNeuronStateRemainingTime {neuron} inline={false} />
  </div>

  <Separator />
{/if}

<style lang="scss">
  .content-cell-details {
    gap: var(--padding-1_5x);
  }
</style>
