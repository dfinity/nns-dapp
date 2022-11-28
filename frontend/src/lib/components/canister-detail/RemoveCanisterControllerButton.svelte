<script lang="ts">
  import { getContext } from "svelte";
  import { IconClose } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";

  export let controller: string;

  const context: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );
  const { toggleModal, store }: CanisterDetailsContext = context;

  const removeController = () => {
    store.update((data) => ({ ...data, selectedController: controller }));
    toggleModal("remove-controller");
  };
</script>

<button
  aria-label={$i18n.core.remove}
  on:click={() => removeController()}
  data-tid="remove-canister-controller-button"
>
  <IconClose size="18px" />
</button>

<style lang="scss">
  button {
    display: flex;
  }
</style>
