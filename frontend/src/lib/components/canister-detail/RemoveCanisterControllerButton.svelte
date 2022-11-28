<script lang="ts">
  import { getContext } from "svelte";
  import { IconClose } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";

  const context: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );
  const { toggleModal }: CanisterDetailsContext = context;
</script>

<button
  aria-label={$i18n.core.remove}
  on:click={() => toggleModal("remove-controller")}
  data-tid="remove-canister-controller-button"
>
  <IconClose size="18px" />
</button>

<style lang="scss">
  button {
    display: flex;
  }
</style>
