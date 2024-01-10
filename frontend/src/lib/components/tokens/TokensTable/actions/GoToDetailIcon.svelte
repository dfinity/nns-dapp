<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { IconRight } from "@dfinity/gix-components";

  // svelte-ignore unused-export-let
  export let userToken: UserTokenData;
</script>

<span data-tid="go-to-detail-icon-component">
  <IconRight />
</span>
