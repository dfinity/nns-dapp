<script lang="ts">
  import AddCyclesModal from "$lib/modals/canisters/AddCyclesModal.svelte";
  import DetachCanisterModal from "$lib/modals/canisters/DetachCanisterModal.svelte";
  import AddCanisterControllerModal from "$lib/modals/canisters/AddCanisterControllerModal.svelte";
  import RemoveCanisterControllerModal from "$lib/modals/canisters/RemoveCanisterControllerModal.svelte";
  import type {
    CanisterDetailModal,
    CanisterDetailModalDetach,
    CanisterDetailModalRemoveController,
    CanisterDetailModalType,
  } from "$lib/types/canister-detail.modal";
  import type { Principal } from "@dfinity/principal";
  import InstallCodeModal from "$lib/modals/canisters/InstallCodeModal.svelte";
  import type { CanisterDetailModalInstallCode } from "$lib/types/canister-detail.modal";

  let modal: CanisterDetailModal | undefined = undefined;
  const close = () => (modal = undefined);

  let type: CanisterDetailModalType | undefined;
  $: type = modal?.type;

  let controller: string | undefined;
  $: controller = (modal as CanisterDetailModalRemoveController | undefined)
    ?.data?.controller;

  let canisterId: Principal | undefined;
  $: canisterId = (
    modal as
      | (CanisterDetailModalDetach | CanisterDetailModalInstallCode)
      | undefined
  )?.data?.canisterId;
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

{#if type === "install-code" && canisterId !== undefined}
  <InstallCodeModal {canisterId} on:nnsClose={close} />
{/if}
