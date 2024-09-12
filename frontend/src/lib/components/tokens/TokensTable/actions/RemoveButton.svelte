<script lang="ts">
  import { ActionType } from "$lib/types/actions";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { IconBin } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let userToken: UserTokenData;

  const dispatcher = createEventDispatcher();
</script>

<button
  class="icon-only remove-button"
  data-tid="send-button-component"
  on:click|stopPropagation|preventDefault={() => {
    dispatcher("nnsAction", { type: ActionType, data: userToken });
  }}
>
  <IconBin />
</button>

<style lang="scss">
  .remove-button {
    color: var(--negative-emphasis);
  }
</style>
