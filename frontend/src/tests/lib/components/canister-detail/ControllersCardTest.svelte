<script lang="ts">
  import ControllersCard from "$lib/components/canister-detail/ControllersCard.svelte";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "$tests/mocks/canisters.mock";
  import { onMount, setContext } from "svelte";

  export let controllers: string[];

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails: () => Promise.resolve(undefined),
  });

  onMount(() => {
    mockCanisterDetailsStore.update((data) => ({
      ...data,
      details: {
        ...data.details,
        settings: {
          ...data.details?.settings,
          controllers,
        },
      },
    }));
  });
</script>

<ControllersCard on:nnsClose />

<CanisterDetailModals />
