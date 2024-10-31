<script lang="ts">
  import { ActionType } from "$lib/types/actions";
  import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";
  import { isUserTokenData } from "$lib/utils/user-token.utils";
  import { IconUp } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  // The UserTokenFailed type was added to unify the action types. Works only with UserTokenData.
  export let userToken: UserTokenData | UserTokenFailed;

  const dispatcher = createEventDispatcher();
</script>

{#if isUserTokenData(userToken)}
  <button
    class="icon-only"
    data-tid="send-button-component"
    on:click|stopPropagation|preventDefault={() => {
      dispatcher("nnsAction", { type: ActionType.Send, data: userToken });
    }}
  >
    <IconUp />
  </button>
{/if}
