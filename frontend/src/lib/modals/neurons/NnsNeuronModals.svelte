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
    NnsNeuronModalVotingHistory
  } from "$lib/types/nns-neuron-detail.modal";

  let modal: NnsNeuronModal<NnsNeuronModalData> | undefined;

  let type: NnsNeuronModalType | undefined;
  $: type = modal?.type;

  let neuron: NeuronInfo | undefined;
  $: neuron = modal?.data?.neuron;

  let followee: FolloweesNeuron | undefined;
  $: followee = (modal as NnsNeuronModalVotingHistory | undefined)?.data?.followee;
</script>

<svelte:window on:nnsNeuronDetailModal={({ detail }) => (modal = detail)} />

{#if neuron !== undefined}
  {#if modal === "increase-dissolve-delay"}
    <IncreaseDissolveDelayModal {neuron} on:nnsClose={close} />
  {/if}

  {#if modal === "split-neuron"}
    <SplitNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "increase-stake"}
    <IncreaseNeuronStakeModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "disburse"}
    <DisburseNnsNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "dissolve"}
    <DissolveActionButtonModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "stake-maturity"}
    <StakeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "merge-maturity"}
    <MergeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "spawn"}
    <SpawnNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "auto-stake-maturity"}
    <AutoStakeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "join-community-fund"}
    <JoinCommunityFundModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "follow"}
    <FollowNeuronsModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "add-hotkey"}
    <AddHotkeyModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "voting-history" && followee !== undefined}
    <VotingHistoryModal
      neuronId={followee.neuronId}
      on:nnsClose={close}
    />
  {/if}
{/if}
