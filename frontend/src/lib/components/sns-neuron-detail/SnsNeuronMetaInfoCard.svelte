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
    hasPermissionToSplit,
    isVesting,
  } from "$lib/utils/sns-neuron.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { E8s, NeuronState } from "@dfinity/nns";
  import type { Token } from "@dfinity/utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import SnsNeuronCardTitle from "$lib/components/sns-neurons/SnsNeuronCardTitle.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import SnsNeuronAge from "$lib/components/sns-neurons/SnsNeuronAge.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SnsNeuronStateRemainingTime from "$lib/components/sns-neurons/SnsNeuronStateRemainingTime.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { authStore } from "$lib/stores/auth.store";
  import SplitSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/SplitSnsNeuronButton.svelte";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";
  import SnsNeuronVestingPeriodRemaining from "./SnsNeuronVestingPeriodRemaining.svelte";

  export let parameters: SnsNervousSystemParameters;
  export let token: Token;
  export let transactionFee: E8s;

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  let allowedToSplit: boolean;
  $: allowedToSplit =
    nonNullish(neuron) &&
    hasPermissionToSplit({
      neuron,
      identity: $authStore.identity,
    }) &&
    !isVesting(neuron);

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

<TestIdWrapper testId="sns-neuron-meta-info-card-component">
  {#if nonNullish(neuron) && nonNullish(neuronState)}
    <div class="content-cell-details" data-tid="sns-neuron-meta-info-content">
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

      <SnsNeuronVestingPeriodRemaining {neuron} />

      <div class="buttons">
        {#if allowedToSplit}
          <SplitSnsNeuronButton
            {neuron}
            {parameters}
            {token}
            {transactionFee}
          />
        {/if}
      </div>
    </div>

    <Separator />
  {/if}
</TestIdWrapper>

<style lang="scss">
  .content-cell-details {
    gap: var(--padding-1_5x);
  }
</style>
