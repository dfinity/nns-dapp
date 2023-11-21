<script lang="ts">
  import { ActionType } from "$lib/types/actions";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { IconUp } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let userToken: UserTokenData;

  const dispatcher = createEventDispatcher();
</script>

<button
  class="icon"
  data-tid="send-button-component"
  on:click|stopPropagation={() => {
    dispatcher("nnsAction", { type: ActionType.Send, data: userToken });
  }}
>
  <IconUp />
</button>
