<script lang="ts">
  import { setContext } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import RemoveCanisterControllerButton from "../../../../lib/components/canister_details/RemoveCanisterControllerButton.svelte";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../../../lib/types/canister-detail.context";
  import { mockCanisterDetailsStore } from "../../../mocks/canisters.mock";

  export let reloadDetails: (canisterId: Principal) => Promise<void>;
  export let controller: string;

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: mockCanisterDetailsStore,
    reloadDetails,
  });
</script>

<RemoveCanisterControllerButton {controller} />
