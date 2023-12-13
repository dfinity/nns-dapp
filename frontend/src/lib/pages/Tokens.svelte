<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";

  export let userTokensData: UserTokenData[];
</script>

<TestIdWrapper testId="tokens-page-component">
  <TokensTable
    {userTokensData}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header}
  />
</TestIdWrapper>
