<script lang="ts">
  import AddCyclesModal from "$lib/modals/canisters/AddCyclesModal.svelte";
  import type {
    CanisterDetailsContext,
    CanisterDetailsModal,
  } from "$lib/types/canister-detail.context";
  import { CANISTER_DETAILS_CONTEXT_KEY } from "$lib/types/canister-detail.context";
  import { getContext } from "svelte";
  import type { CanisterId } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import DetachCanisterModal from "$lib/modals/canisters/DetachCanisterModal.svelte";
  import AddControllerModal from "$lib/modals/canisters/AddControllerModal.svelte";

  const context: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );
  const { store }: CanisterDetailsContext = context;

  let modal: CanisterDetailsModal | undefined;
  $: ({ modal } = $store);

  let canisterId: CanisterId | undefined;
  $: canisterId = $store.info?.canister_id;

  const close = () => store.update((data) => ({ ...data, modal: undefined }));
</script>

{#if canisterId !== undefined}
  {#if modal === "add-cycles"}
    <AddCyclesModal on:nnsClose={close} />
  {/if}

  {#if modal === "detach"}
    <DetachCanisterModal {canisterId} on:nnsClose={close} />
  {/if}

  {#if modal === "add-controller"}
    <AddControllerModal on:nnsClose={close} />
  {/if}
{/if}
