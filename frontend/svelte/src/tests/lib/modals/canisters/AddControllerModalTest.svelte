<script lang="ts">
  import { setContext } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import AddControllerModal from "../../../../lib/modals/canisters/AddControllerModal.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../../../lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "../../../mocks/canisters.mock";

  export let reloadDetails: (canisterId: Principal) => Promise<void>;

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails,
  });
</script>

<AddControllerModal on:nnsClose />
