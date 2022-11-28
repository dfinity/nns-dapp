<script lang="ts">
    import AddCyclesModal from "$lib/modals/canisters/AddCyclesModal.svelte";
    import type {CanisterDetailsContext, CanisterDetailsModal} from "$lib/types/canister-detail.context";
    import {CANISTER_DETAILS_CONTEXT_KEY} from "$lib/types/canister-detail.context";
    import {getContext} from "svelte";

    const context: CanisterDetailsContext = getContext<CanisterDetailsContext>(
        CANISTER_DETAILS_CONTEXT_KEY
    );
    const { store }: CanisterDetailsContext = context;

    let modal: CanisterDetailsModal | undefined;
    $: ({ modal } = $store);

    const close = () => store.update((data) => ({ ...data, modal: undefined }));
</script>


{#if modal === "add-cycles"}
    <AddCyclesModal on:nnsClose={close} />
{/if}