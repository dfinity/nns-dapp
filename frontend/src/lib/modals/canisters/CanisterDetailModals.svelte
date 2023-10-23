<script lang="ts">
  import AddCyclesModal from "$lib/modals/canisters/AddCyclesModal.svelte";
  import UnlinkCanisterModal from "$lib/modals/canisters/UnlinkCanisterModal.svelte";
  import AddCanisterControllerModal from "$lib/modals/canisters/AddCanisterControllerModal.svelte";
  import RemoveCanisterControllerModal from "$lib/modals/canisters/RemoveCanisterControllerModal.svelte";
  import type {
    CanisterDetailModal,
    CanisterDetailModalDetach,
    CanisterDetailModalRemoveController,
    CanisterDetailModalType,
  } from "$lib/types/canister-detail.modal";
  import type { Principal } from "@dfinity/principal";
  import RenameCanisterModal from "./RenameCanisterModal.svelte";

  let modal: CanisterDetailModal | undefined = undefined;
  const close = () => (modal = undefined);

  let type: CanisterDetailModalType | undefined;
  $: type = modal?.type;

  let controller: string | undefined;
  $: controller = (modal as CanisterDetailModalRemoveController | undefined)
    ?.data?.controller;

  let canisterId: Principal | undefined;
  $: canisterId = (modal as CanisterDetailModalDetach | undefined)?.data
    ?.canisterId;

  const onNnsCanisterDetailModal = ({
    detail,
  }: CustomEvent<CanisterDetailModal>) => (modal = detail);
</script>

<svelte:window on:nnsCanisterDetailModal={onNnsCanisterDetailModal} />

{#if type === "add-cycles"}
  <AddCyclesModal on:nnsClose={close} />
{/if}

{#if type === "unlink" && canisterId !== undefined}
  <UnlinkCanisterModal {canisterId} on:nnsClose={close} />
{/if}

{#if type === "add-controller"}
  <AddCanisterControllerModal on:nnsClose={close} />
{/if}

{#if type === "remove-controller" && controller !== undefined}
  <RemoveCanisterControllerModal {controller} on:nnsClose={close} />
{/if}

{#if type === "rename"}
  <RenameCanisterModal on:nnsClose={close} />
{/if}
