<script lang="ts">
  import AddCyclesModal from "$lib/modals/canisters/AddCyclesModal.svelte";
  import DetachCanisterModal from "$lib/modals/canisters/DetachCanisterModal.svelte";
  import AddCanisterControllerModal from "$lib/modals/canisters/AddCanisterControllerModal.svelte";
  import RemoveCanisterControllerModal from "$lib/modals/canisters/RemoveCanisterControllerModal.svelte";
  import type {
    CanisterDetailsModal,
    CanisterDetailsModalDetach,
    CanisterDetailsModalRemoveController,
    CanisterDetailsModalType,
  } from "$lib/types/canister-detail.modal";
  import type { Principal } from "@dfinity/principal";

  let modal: CanisterDetailsModal | undefined = undefined;
  const close = () => (modal = undefined);

  let type: CanisterDetailsModalType | undefined;
  $: type = modal?.type;

  let controller: string | undefined;
  $: controller = (modal as CanisterDetailsModalRemoveController | undefined)
    ?.data?.controller;

  let canisterId: Principal | undefined;
  $: canisterId = (modal as CanisterDetailsModalDetach | undefined)?.data
    ?.canisterId;
</script>

<svelte:window on:nnsCanisterDetailModal={({ detail }) => (modal = detail)} />

{#if type === "add-cycles"}
  <AddCyclesModal on:nnsClose={close} />
{/if}

{#if type === "detach" && canisterId !== undefined}
  <DetachCanisterModal {canisterId} on:nnsClose={close} />
{/if}

{#if type === "add-controller"}
  <AddCanisterControllerModal on:nnsClose={close} />
{/if}

{#if type === "remove-controller" && controller !== undefined}
  <RemoveCanisterControllerModal {controller} on:nnsClose={close} />
{/if}
