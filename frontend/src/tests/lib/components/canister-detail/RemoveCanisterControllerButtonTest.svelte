<script lang="ts">
  import RemoveCanisterControllerButton from "$lib/components/canister-detail/RemoveCanisterControllerButton.svelte";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "$tests/mocks/canisters.mock";
  import type { Principal } from "@dfinity/principal";
  import { setContext } from "svelte";

  export let reloadDetails: (canisterId: Principal) => Promise<void>;
  export let controller: string;

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails,
  });
</script>

<RemoveCanisterControllerButton {controller} />

<CanisterDetailModals />
