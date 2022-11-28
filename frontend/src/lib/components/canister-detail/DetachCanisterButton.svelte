<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import { getContext } from "svelte";

  const context: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );
  const { toggleModal }: CanisterDetailsContext = context;
</script>

<button
  class="primary"
  type="button"
  on:click={() => toggleModal("detach")}
  disabled={$busy}
  data-tid="detach-canister-button"
>
  {$i18n.canister_detail.detach}
</button>
