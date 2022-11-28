<script lang="ts">
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
    type SnsNeuronModal,
  } from "$lib/types/sns-neuron-detail.context";
  import type { SnsNeuron } from "@dfinity/sns";
  import { nonNullish } from "$lib/utils/utils";
  import type { Token } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store, reload: reloadNeuron }: SelectedSnsNeuronContext = context;

  let modal: SnsNeuronModal;
  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron, modal } = $store);

  const close = () => store.update((data) => ({ ...data, modal: undefined }));

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore as Token;
</script>

{#if nonNullish(neuron)}
  {#if modal === "increase-dissolve-delay"}
    <IncreaseSnsDissolveDelayModal
      {neuron}
      {token}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if modal === "disburse"}
  <DisburseSnsNeuronModal {neuron} {reloadNeuron} on:nnsClose={close} />
    {/if}
{/if}
