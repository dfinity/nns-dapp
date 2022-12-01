<script lang="ts">
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
    type SnsNeuronModal,
  } from "$lib/types/sns-neuron-detail.context";
  import type { SnsNeuron } from "@dfinity/sns";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import type { Token } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";
  import DissolveSnsNeuronModal from "$lib/modals/sns/neurons/DissolveSnsNeuronModal.svelte";
  import FollowSnsNeuronsModal from "$lib/modals/sns/neurons/FollowSnsNeuronsModal.svelte";
  import AddSnsHotkeyModal from "$lib/modals/sns/neurons/AddSnsHotkeyModal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuronId } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import type { NeuronState } from "@dfinity/nns";
  import { getSnsNeuronState } from "$lib/utils/sns-neuron.utils";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store, reload: reloadNeuron }: SelectedSnsNeuronContext = context;

  let modal: SnsNeuronModal | undefined;
  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron, modal } = $store);

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = $store.selected?.rootCanisterId;

  let neuronId: SnsNeuronId | undefined;
  $: neuronId =
    neuron?.id !== undefined ? fromDefinedNullable(neuron.id) : undefined;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  const close = () => store.update((data) => ({ ...data, modal: undefined }));

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore as Token;
</script>

// TODO: check for rootCanisterId !== undef

{#if nonNullish(neuron)}
  {#if modal === "increase-dissolve-delay" && rootCanisterId !== undefined}
    <IncreaseSnsDissolveDelayModal
      {rootCanisterId}
      {neuron}
      {token}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if modal === "disburse" && rootCanisterId !== undefined}
    <DisburseSnsNeuronModal
      {rootCanisterId}
      {neuron}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if modal === "dissolve" && nonNullish(neuronId) && nonNullish(neuronState)}
    <DissolveSnsNeuronModal
      {neuronId}
      {neuronState}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if modal === "follow" && nonNullish(rootCanisterId)}
    <FollowSnsNeuronsModal {neuron} on:nnsClose={close} {rootCanisterId} />
  {/if}

  {#if modal === "add-hotkey"}
    <AddSnsHotkeyModal on:nnsClose={close} />
  {/if}
{/if}
