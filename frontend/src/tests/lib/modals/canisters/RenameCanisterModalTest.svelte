<script lang="ts">
  import { setContext } from "svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
    type SelectCanisterDetailsStore,
  } from "$lib/types/canister-detail.context";
  import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
  import RenameCanisterModal from "$lib/modals/canisters/RenameCanisterModal.svelte";
  import type { Principal } from "@dfinity/principal";
  import { writable } from "svelte/store";

  export let canisterId: Principal;
  export let name: string;

  const mockCanisterDetailsStore = writable<SelectCanisterDetailsStore>({
    info: {
      name,
      canister_id: canisterId,
    },
    details: {
      ...mockCanisterDetails,
      id: canisterId,
    },
    controller: true,
  });

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails: () => Promise.resolve(),
  });
</script>

<RenameCanisterModal on:nnsClose />
