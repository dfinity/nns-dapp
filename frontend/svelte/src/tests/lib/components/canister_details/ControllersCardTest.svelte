<script lang="ts">
  import { onMount, setContext } from "svelte";
  import ControllersCard from "../../../../lib/components/canister_details/ControllersCard.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../../../lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "../../../mocks/canisters.mock";

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
