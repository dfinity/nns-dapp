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
  } from "$lib/utils/sns-neuron.utils";
  import { isDefined, isNullish, nonNullish } from "$lib/utils/utils";
  import type { NeuronState, Token } from "@dfinity/nns";
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
  import type { Principal } from "@dfinity/principal";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import type { NervousSystemParameters } from "@dfinity/sns";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = $store.selected?.rootCanisterId;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  // TODO: move to context?
  let parameters: NervousSystemParameters | undefined;
  $: parameters =
    $snsParametersStore?.[rootCanisterId?.toText() ?? ""]?.parameters;

  // TODO: refactor to param?
  let token: Token;
  token = $snsTokenSymbolSelectedStore as Token;

  let allowedToSplit: boolean;
  $: allowedToSplit =
    nonNullish(neuron) &&
    hasPermissionToSplit({
      neuron,
      identity: $authStore.identity,
    });

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

{#if nonNullish(neuron) && nonNullish(neuronState) && nonNullish(parameters)}
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

    <div class="buttons">
      {#if allowedToSplit}
        <SplitSnsNeuronButton {neuron} {parameters} {token} />
      {/if}
    </div>
  </div>

  <Separator />
{/if}

<style lang="scss">
  .content-cell-details {
    gap: var(--padding-1_5x);
  }
</style>
