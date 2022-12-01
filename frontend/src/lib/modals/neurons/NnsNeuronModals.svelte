<script lang="ts">
  import IncreaseDissolveDelayModal from "$lib/modals/neurons/IncreaseDissolveDelayModal.svelte";
  import SplitNeuronModal from "$lib/modals/neurons/SplitNeuronModal.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import IncreaseNeuronStakeModal from "$lib/modals/neurons/IncreaseNeuronStakeModal.svelte";
  import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
  import DissolveActionButtonModal from "$lib/modals/neurons/DissolveActionButtonModal.svelte";
  import AutoStakeMaturityModal from "$lib/modals/neurons/AutoStakeMaturityModal.svelte";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import MergeMaturityModal from "$lib/modals/neurons/MergeMaturityModal.svelte";
  import SpawnNeuronModal from "$lib/modals/neurons/SpawnNeuronModal.svelte";
  import JoinCommunityFundModal from "$lib/modals/neurons/JoinCommunityFundModal.svelte";
  import FollowNeuronsModal from "$lib/modals/neurons/FollowNeuronsModal.svelte";
  import AddHotkeyModal from "$lib/modals/neurons/AddHotkeyModal.svelte";
  import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
  import type { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import type {
    NnsNeuronModal,
    NnsNeuronModalData,
    NnsNeuronModalType,
    NnsNeuronModalVotingHistory,
  } from "$lib/types/nns-neuron-detail.modal";
  import { nonNullish } from "$lib/utils/utils";

  let modal: NnsNeuronModal<NnsNeuronModalData> | undefined;
  const close = () => (modal = undefined);

  let type: NnsNeuronModalType | undefined;
  $: type = modal?.type;

  let neuron: NeuronInfo | undefined | null;
  $: neuron = modal?.data?.neuron;

  let followee: FolloweesNeuron | undefined;
  $: followee = (modal as NnsNeuronModalVotingHistory | undefined)?.data
    ?.followee;
</script>

<svelte:window on:nnsNeuronDetailModal={({ detail }) => (modal = detail)} />

{#if nonNullish(neuron)}
  {#if type === "increase-dissolve-delay"}
    <IncreaseDissolveDelayModal {neuron} on:nnsClose={close} />
  {/if}

  {#if type === "split-neuron"}
    <SplitNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "increase-stake"}
    <IncreaseNeuronStakeModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "disburse"}
    <DisburseNnsNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "dissolve"}
    <DissolveActionButtonModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "stake-maturity"}
    <StakeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "merge-maturity"}
    <MergeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "spawn"}
    <SpawnNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "auto-stake-maturity"}
    <AutoStakeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "join-community-fund"}
    <JoinCommunityFundModal on:nnsClose={close} {neuron} />
  {/if}

  {#if type === "follow"}
    <FollowNeuronsModal on:nnsClose={close} neuronId={neuron.neuronId} />
  {/if}

  {#if type === "add-hotkey"}
    <AddHotkeyModal on:nnsClose={close} {neuron} />
  {/if}
{/if}

{#if type === "voting-history" && followee !== undefined}
  <VotingHistoryModal neuronId={followee.neuronId} on:nnsClose={close} />
{/if}