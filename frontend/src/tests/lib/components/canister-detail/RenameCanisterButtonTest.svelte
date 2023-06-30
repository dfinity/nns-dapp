<script lang="ts">
  import { setContext } from "svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "$tests/mocks/canisters.mock";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import RenameCanisterButton from "$lib/components/canister-detail/RenameCanisterButton.svelte";

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails: () => Promise.resolve(undefined),
  });
</script>

<RenameCanisterButton />

<CanisterDetailModals />
