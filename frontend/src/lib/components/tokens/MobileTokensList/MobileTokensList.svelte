<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";

  /* eslint-disable-next-line */
  export let userTokensData: UserTokenData[];
</script>

<div data-tid="mobile-tokens-list-component">
  {`Mobile List: ${userTokensData.length}`}
</div>
