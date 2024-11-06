<script lang="ts">
  import { ActionType } from "$lib/types/actions";
  import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";
  import { IconBin } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let userToken: UserTokenData | UserTokenFailed;

  const dispatcher = createEventDispatcher();
</script>

<button
  class="icon-only remove-button"
  data-tid="remove-button-component"
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
