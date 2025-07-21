<script lang="ts">
  import type { UserTokenData, UserTokenFailed } from "$lib/types/tokens-page";

  // svelte-ignore unused-export-let
  export let userToken: UserTokenData | UserTokenFailed;
</script>

<span class="blank"></span>

<style lang="scss">
  .blank {
    width: 36px;
  }
</style>
