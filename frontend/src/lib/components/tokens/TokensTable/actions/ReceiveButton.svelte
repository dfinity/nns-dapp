<script lang="ts">
  import { ActionType } from "$lib/types/actions";
  import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";
  import { isUserTokenData } from "$lib/utils/user-token.utils";
  import { IconQRCodeScanner } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  // The UserTokenFailed type was added to unify the action types. However, this action only works with UserTokenData.
  export let userToken: UserTokenData | UserTokenFailed;

  const dispatcher = createEventDispatcher();
</script>

{#if isUserTokenData(userToken)}
  <button
    class="icon-only"
    data-tid="receive-button-component"
    on:click|preventDefault|stopPropagation={() => {
      dispatcher("nnsAction", { type: ActionType.Receive, data: userToken });
    }}
  >
    <IconQRCodeScanner />
  </button>
{/if}
