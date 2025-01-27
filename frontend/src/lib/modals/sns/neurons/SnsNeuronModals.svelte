<script lang="ts">
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";
  import AddMaturityModal from "$lib/modals/sns/neurons/AddMaturityModal.svelte";
  import AddPermissionsModal from "$lib/modals/sns/neurons/AddPermissionsModal.svelte";
  import AddSnsHotkeyModal from "$lib/modals/sns/neurons/AddSnsHotkeyModal.svelte";
  import DissolveSnsNeuronModal from "$lib/modals/sns/neurons/DissolveSnsNeuronModal.svelte";
  import FollowSnsNeuronsModal from "$lib/modals/sns/neurons/FollowSnsNeuronsModal.svelte";
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
  import SnsActiveDisbursementsModal from "$lib/modals/sns/neurons/SnsActiveDisbursementsModal.svelte";
  import SnsAutoStakeMaturityModal from "$lib/modals/sns/neurons/SnsAutoStakeMaturityModal.svelte";
  import SnsDisburseMaturityModal from "$lib/modals/sns/neurons/SnsDisburseMaturityModal.svelte";
  import SnsIncreaseStakeNeuronModal from "$lib/modals/sns/neurons/SnsIncreaseStakeNeuronModal.svelte";
  import SnsStakeMaturityModal from "$lib/modals/sns/neurons/SnsStakeMaturityModal.svelte";
  import SplitSnsNeuronModal from "$lib/modals/sns/neurons/SplitSnsNeuronModal.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import type {
    SnsNeuronModal,
    SnsNeuronModalType,
  } from "$lib/types/sns-neuron-detail.modal";
  import { getSnsNeuronState } from "$lib/utils/sns-neuron.utils";
  import type { E8s, NeuronState } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type {
    SnsNervousSystemParameters,
    SnsNeuron,
    SnsNeuronId,
  } from "@dfinity/sns";
  import {
    fromDefinedNullable,
    isNullish,
    nonNullish,
    type Token,
  } from "@dfinity/utils";
  import { getContext } from "svelte";

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

  const onSnsNeuronDetailModal = ({ detail }: CustomEvent<SnsNeuronModal>) =>
    (modal = detail);
</script>

<svelte:window on:snsNeuronDetailModal={onSnsNeuronDetailModal} />

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

  {#if type === "increase-dissolve-delay" && nonNullish(rootCanisterId) && nonNullish(token)}
    <IncreaseSnsDissolveDelayModal
      {rootCanisterId}
      {neuron}
      {token}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if type === "disburse" && nonNullish(rootCanisterId)}
    <DisburseSnsNeuronModal
      {rootCanisterId}
      {neuron}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if type === "follow" && nonNullish(rootCanisterId)}
    <FollowSnsNeuronsModal {neuron} on:nnsClose={close} {rootCanisterId} />
  {/if}

  {#if type === "stake-maturity" && nonNullish(rootCanisterId) && nonNullish(neuronId)}
    <SnsStakeMaturityModal
      {reloadNeuron}
      on:nnsClose={close}
      {neuronId}
      {neuron}
      {rootCanisterId}
    />
  {/if}

  {#if type === "disburse-maturity" && nonNullish(rootCanisterId) && nonNullish(neuronId)}
    <SnsDisburseMaturityModal
      {reloadNeuron}
      on:nnsClose={close}
      {neuronId}
      {neuron}
      {rootCanisterId}
    />
  {/if}

  {#if type === "view-active-disbursements"}
    <SnsActiveDisbursementsModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "auto-stake-maturity" && nonNullish(rootCanisterId) && nonNullish(neuronId)}
    <SnsAutoStakeMaturityModal
      {reloadNeuron}
      on:nnsClose={close}
      {neuronId}
      {neuron}
      {rootCanisterId}
    />
  {/if}

  {#if type === "split-neuron" && nonNullish(rootCanisterId) && nonNullish(neuronId) && nonNullish(token) && nonNullish(parameters) && nonNullish(transactionFee)}
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

  {#if type === "increase-stake" && nonNullish(rootCanisterId) && nonNullish(token) && nonNullish(neuronId)}
    <SnsIncreaseStakeNeuronModal
      {rootCanisterId}
      {token}
      {neuronId}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}

  {#if type === "dev-add-permissions" && IS_TESTNET && nonNullish(rootCanisterId) && nonNullish(neuronId)}
    <AddPermissionsModal
      {rootCanisterId}
      {neuronId}
      {reloadNeuron}
      on:nnsClose={close}
      mode="add"
    />
  {/if}

  {#if type === "dev-remove-permissions" && IS_TESTNET && nonNullish(rootCanisterId) && nonNullish(neuronId)}
    <AddPermissionsModal
      {rootCanisterId}
      {neuronId}
      {reloadNeuron}
      on:nnsClose={close}
      mode="remove"
    />
  {/if}

  {#if type === "dev-add-maturity" && IS_TESTNET && nonNullish(rootCanisterId) && nonNullish(neuronId)}
    <AddMaturityModal
      {rootCanisterId}
      {neuronId}
      {reloadNeuron}
      on:nnsClose={close}
    />
  {/if}
{/if}
