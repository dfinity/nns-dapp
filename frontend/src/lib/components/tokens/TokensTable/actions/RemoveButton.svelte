<script lang="ts">
  import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";
  import { IconBin } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { ActionType } from "$lib/types/actions";

  export let userToken: UserTokenData | UserTokenFailed;

  const dispatcher = createEventDispatcher();
</script>

<button
  class="icon-only remove-button"
  data-tid="send-button-component"
  on:click|preventDefault|stopPropagation={() => {
    dispatcher("nnsAction", { type: ActionType.Remove, data: userToken });
  }}
>
  <IconBin />
</button>

<style lang="scss">
  .remove-button {
    color: var(--negative-emphasis);
  }
</style>
