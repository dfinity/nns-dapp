<script lang="ts">
  import AddControllerModal from "$lib/modals/canisters/AddCanisterControllerModal.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "$tests/mocks/canisters.mock";
  import type { Principal } from "@dfinity/principal";
  import { setContext } from "svelte";

  export let reloadDetails: (canisterId: Principal) => Promise<void>;

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails,
  });
</script>

<AddControllerModal on:nnsClose />
