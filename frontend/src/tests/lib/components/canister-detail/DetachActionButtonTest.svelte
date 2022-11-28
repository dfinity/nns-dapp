<script lang="ts">
  import { setContext } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import {
    mockCanisterDetailsStore,
    mockToggleCanisterModal,
  } from "../../../mocks/canisters.mock";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import DetachActionButton from "$lib/components/canister-detail/DetachCanisterButton.svelte";

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails: async () => {
      // Do nnothing
    },
    toggleModal: mockToggleCanisterModal,
  });
</script>

<DetachActionButton />

<CanisterDetailModals />
