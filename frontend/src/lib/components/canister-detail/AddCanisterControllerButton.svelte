<script lang="ts">
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
  data-tid="add-canister-controller-button"
  on:click={() => toggleModal("add-controller")}
  class="primary">{$i18n.canister_detail.add_controller}</button
>
