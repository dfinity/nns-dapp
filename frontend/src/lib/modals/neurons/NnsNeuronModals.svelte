<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import AddHotkeyModal from "$lib/modals/neurons/AddHotkeyModal.svelte";
  import ChangeNeuronVisibilityModal from "$lib/modals/neurons/ChangeNeuronVisibilityModal.svelte";
  import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
  import DissolveActionButtonModal from "$lib/modals/neurons/DissolveActionButtonModal.svelte";
  import FollowNeuronsModal from "$lib/modals/neurons/FollowNeuronsModal.svelte";
  import IncreaseDissolveDelayModal from "$lib/modals/neurons/IncreaseDissolveDelayModal.svelte";
  import IncreaseNeuronStakeModal from "$lib/modals/neurons/IncreaseNeuronStakeModal.svelte";
  import JoinCommunityFundModal from "$lib/modals/neurons/JoinCommunityFundModal.svelte";
  import LosingRewardNeuronsModal from "$lib/modals/neurons/LosingRewardNeuronsModal.svelte";
  import NnsActiveDisbursementsModal from "$lib/modals/neurons/NnsActiveDisbursementsModal.svelte";
  import NnsAutoStakeMaturityModal from "$lib/modals/neurons/NnsAutoStakeMaturityModal.svelte";
  import NnsDisburseMaturityModal from "$lib/modals/neurons/NnsDisburseMaturityModal.svelte";
  import NnsStakeMaturityModal from "$lib/modals/neurons/NnsStakeMaturityModal.svelte";
  import SpawnNeuronModal from "$lib/modals/neurons/SpawnNeuronModal.svelte";
  import SplitNeuronModal from "$lib/modals/neurons/SplitNnsNeuronModal.svelte";
  import UpdateVotingPowerRefreshedModal from "$lib/modals/neurons/UpdateVotingPowerRefreshedModal.svelte";
  import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
  import NnsAddMaturityModal from "$lib/modals/sns/neurons/NnsAddMaturityModal.svelte";
  import type {
    NnsNeuronModal,
    NnsNeuronModalData,
    NnsNeuronModalType,
    NnsNeuronModalVotingHistory,
  } from "$lib/types/nns-neuron-detail.modal";
  import {
    isPublicNeuron,
    type FolloweesNeuron,
  } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  let modal: NnsNeuronModal<NnsNeuronModalData> | undefined;
  const close = () => (modal = undefined);

  let type: NnsNeuronModalType | undefined;
  $: type = modal?.type;

  let neuron: NeuronInfo | undefined | null;
  $: neuron = modal?.data?.neuron;

  let followee: FolloweesNeuron | undefined;
  $: followee = (modal as NnsNeuronModalVotingHistory | undefined)?.data
    ?.followee;

  const onNnsNeuronDetailModal = ({
    detail,
  }: CustomEvent<NnsNeuronModal<NnsNeuronModalData>>) => (modal = detail);
</script>

<svelte:window on:nnsNeuronDetailModal={onNnsNeuronDetailModal} />

<TestIdWrapper testId="nns-neuron-modals-component">
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
      <NnsStakeMaturityModal on:nnsClose={close} {neuron} />
    {/if}

    {#if type === "spawn"}
      <SpawnNeuronModal on:nnsClose={close} {neuron} />
    {/if}
    {#if type === "view-active-disbursements"}
      <NnsActiveDisbursementsModal {close} {neuron} />
    {/if}

    {#if type === "disburse-maturity"}
      <NnsDisburseMaturityModal {close} {neuron} />
    {/if}

    {#if type === "auto-stake-maturity"}
      <NnsAutoStakeMaturityModal on:nnsClose={close} {neuron} />
    {/if}

    {#if type === "join-community-fund"}
      <JoinCommunityFundModal on:nnsClose={close} {neuron} />
    {/if}

    {#if type === "follow"}
      <FollowNeuronsModal onClose={close} neuronId={neuron.neuronId} />
    {/if}

    {#if type === "add-hotkey"}
      <AddHotkeyModal on:nnsClose={close} {neuron} />
    {/if}

    {#if type === "dev-add-maturity" && IS_TESTNET}
      <NnsAddMaturityModal {neuron} on:nnsClose={close} />
    {/if}

    {#if type === "dev-update-voting-power-refreshed" && IS_TESTNET}
      <UpdateVotingPowerRefreshedModal {neuron} on:nnsClose={close} />
    {/if}

    {#if type === "change-neuron-visibility"}
      <ChangeNeuronVisibilityModal
        defaultSelectedNeuron={neuron}
        makePublic={!isPublicNeuron(neuron)}
        on:nnsClose={close}
      />
    {/if}

    {#if type === "confirm-following"}
      <LosingRewardNeuronsModal
        withNeuronNavigation={false}
        neurons={[neuron]}
        on:nnsClose={close}
      />
    {/if}
  {/if}

  {#if type === "voting-history" && nonNullish(followee)}
    <VotingHistoryModal neuronId={followee.neuronId} on:nnsClose={close} />
  {/if}
</TestIdWrapper>
