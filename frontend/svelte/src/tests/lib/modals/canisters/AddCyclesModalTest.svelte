<script lang="ts">
  import { setContext } from "svelte";
  import AddCyclesModal from "../../../../lib/modals/canisters/AddCyclesModal.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../../../lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "../../../mocks/canisters.mock";

  export let refetchDetails: () => Promise<void>;

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    refetchDetails,
  });
</script>

<AddCyclesModal on:nnsClose />
