<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { IconAccountsPage, PageBanner } from "@dfinity/gix-components";

  export let userTokensData: UserTokenData[] = [];
</script>

<div class="content" data-tid="accounts-landing-page">
  <PageBanner>
    <IconAccountsPage slot="image" />
    <svelte:fragment slot="title">{$i18n.auth_accounts.title}</svelte:fragment>
    <p class="description" slot="description">{$i18n.auth_accounts.text}</p>
    <SignIn slot="actions" />
  </PageBanner>

  {#if userTokensData.length > 0}
    <TokensTable
      {userTokensData}
      firstColumnHeader={$i18n.tokens.accounts_header}
    />
  {/if}
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
