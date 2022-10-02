<script lang="ts">
  import { setContext } from "svelte";
  import AddCyclesModal from "../../../../lib/modals/canisters/AddCyclesModal.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../../../lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "../../../mocks/canisters.mock";

  export let reloadDetails: (canisterId) => Promise<void>;

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails,
  });
</script>

<AddCyclesModal on:nnsClose />
