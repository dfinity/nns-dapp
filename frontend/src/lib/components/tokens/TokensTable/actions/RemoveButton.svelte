<script lang="ts">
  import type { UserTokenFailed } from "$lib/types/tokens-page";
  import { IconBin } from "@dfinity/gix-components";

  // svelte-ignore unused-export-let
  export let userToken: UserTokenFailed;
</script>

<button
  class="icon-only remove-button"
  data-tid="send-button-component"
  on:click|stopPropagation|preventDefault={() => {
    // TODO: Implement remove imported token action
  }}
>
  <IconBin />
</button>

<style lang="scss">
  .remove-button {
    color: var(--negative-emphasis);
  }
</style>
