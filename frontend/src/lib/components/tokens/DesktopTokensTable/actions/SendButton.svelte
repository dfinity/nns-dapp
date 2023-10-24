<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { IconNorthEast } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let userToken: UserTokenData;

  const dispatcher = createEventDispatcher();
</script>

<button
  class="icon"
  data-tid="send-button-component"
  on:click|stopPropagation={() => {
    dispatcher("nnsSend", userToken);
  }}
>
  <IconNorthEast />
</button>
