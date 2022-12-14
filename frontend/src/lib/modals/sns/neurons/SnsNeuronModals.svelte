<script lang="ts">
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import type { Token } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";
  import DissolveSnsNeuronModal from "$lib/modals/sns/neurons/DissolveSnsNeuronModal.svelte";
  import FollowSnsNeuronsModal from "$lib/modals/sns/neurons/FollowSnsNeuronsModal.svelte";
  import AddSnsHotkeyModal from "$lib/modals/sns/neurons/AddSnsHotkeyModal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import type { NeuronState } from "@dfinity/nns";
  import { getSnsNeuronState } from "$lib/utils/sns-neuron.utils";
  import type {
    SnsNeuronModal,
    SnsNeuronModalType,
  } from "$lib/types/sns-neuron-detail.modal";
  import SnsStakeMaturityModal from "$lib/modals/sns/neurons/SnsStakeMaturityModal.svelte";
  import SnsAutoStakeMaturityModal from "$lib/modals/sns/neurons/SnsAutoStakeMaturityModal.svelte";
  import SnsIncreaseStakeNeuronModal from "$lib/modals/sns/neurons/SnsIncreaseStakeNeuronModal.svelte";

  // Modal events

  let modal: SnsNeuronModal | undefined;
  const close = () => (modal = undefined);

  let type: SnsNeuronModalType | undefined;
  $: type = modal?.type;

  // Context data

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store, reload: reloadNeuron }: SelectedSnsNeuronContext = context;

  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron } = $store);

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = $store.selected?.rootCanisterId;

  let neuronId: SnsNeuronId | undefined;
  $: neuronId =
    neuron?.id !== undefined ? fromDefinedNullable(neuron.id) : undefined;

  let neuronState: NeuronState | undefined;
  $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

  let token: Token | undefined;
  $: token = $snsTokenSymbolSelectedStore;
</script>

<svelte:window on:snsNeuronDetailModal={({ detail }) => (modal = detail)} />

{#if nonNullish(neuron)}
  {#if type === "dissolve" && nonNullish(neuronId) && nonNullish(neuronState)}
    <DissolveSnsNeuronModal
      {neuronId}
      {neuronState}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if type === "add-hotkey"}
    <AddSnsHotkeyModal on:nnsClose={close} />
  {/if}

  {#if nonNullish(rootCanisterId) && nonNullish(token)}
    {#if type === "increase-dissolve-delay"}
      <IncreaseSnsDissolveDelayModal
        {rootCanisterId}
        {neuron}
        {token}
        {reloadNeuron}
        on:nnsClose={close}
      />
    {/if}

    {#if type === "disburse"}
      <DisburseSnsNeuronModal
        {rootCanisterId}
        {neuron}
        {reloadNeuron}
        on:nnsClose={close}
      />
    {/if}

    {#if type === "follow"}
      <FollowSnsNeuronsModal {neuron} on:nnsClose={close} {rootCanisterId} />
    {/if}

    {#if nonNullish(neuronId)}
      {#if type === "stake-maturity"}
        <SnsStakeMaturityModal
          {reloadNeuron}
          on:nnsClose={close}
          {neuronId}
          {neuron}
          {rootCanisterId}
        />
      {/if}

      {#if type === "auto-stake-maturity"}
        <SnsAutoStakeMaturityModal
          {reloadNeuron}
          on:nnsClose={close}
          {neuronId}
          {neuron}
          {rootCanisterId}
        />
      {/if}
    {/if}

    {#if type === "increase-stake"}
      <SnsIncreaseStakeNeuronModal
        {rootCanisterId}
        {token}
        on:nnsClose={close}
      />
    {/if}
  {/if}
{/if}
