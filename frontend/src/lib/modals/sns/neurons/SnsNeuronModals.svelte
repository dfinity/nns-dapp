<script lang="ts">
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { E8s, Token } from "@dfinity/nns";
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
  import SplitSnsNeuronModal from "$lib/modals/sns/neurons/SplitSnsNeuronModal.svelte";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import SnsIncreaseStakeNeuronModal from "$lib/modals/sns/neurons/SnsIncreaseStakeNeuronModal.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import AddPermissionsModal from "./AddPermissionsModal.svelte";

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

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore as Token;

  let parameters: SnsNervousSystemParameters | undefined;
  $: parameters = nonNullish(rootCanisterId)
    ? $snsParametersStore?.[rootCanisterId.toText()]?.parameters
    : undefined;

  let transactionFee: E8s | undefined;
  $: transactionFee = $snsSelectedTransactionFeeStore?.toE8s();
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

      {#if nonNullish(parameters) && nonNullish(transactionFee)}
        {#if type === "split-neuron"}
          <SplitSnsNeuronModal
            {rootCanisterId}
            {neuron}
            {token}
            {parameters}
            {transactionFee}
            {reloadNeuron}
            on:nnsClose={close}
          />
        {/if}
      {/if}

      {#if type === "increase-stake"}
        <SnsIncreaseStakeNeuronModal
          {rootCanisterId}
          {token}
          {neuronId}
          {reloadNeuron}
          on:nnsClose={close}
        />
      {/if}

      {#if type === "dev-add-permissions" && IS_TESTNET}
        <AddPermissionsModal
          {rootCanisterId}
          {neuronId}
          {reloadNeuron}
          on:nnsClose={close}
          mode="add"
        />
      {/if}

      {#if type === "dev-remove-permissions" && IS_TESTNET}
        <AddPermissionsModal
          {rootCanisterId}
          {neuronId}
          {reloadNeuron}
          on:nnsClose={close}
          mode="remove"
        />
      {/if}
    {/if}
  {/if}
{/if}
