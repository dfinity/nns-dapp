<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { PageBanner, IconAccountsPage } from "@dfinity/gix-components";

  export let userTokensData: UserToken[];
</script>

<div class="content" data-tid="sign-in-tokens-page-component">
  <PageBanner>
    <IconAccountsPage slot="image" />
    <svelte:fragment slot="title">{$i18n.auth_accounts.title}</svelte:fragment>
    <p class="description" slot="description">{$i18n.auth_accounts.text}</p>
    <SignIn slot="actions" />
  </PageBanner>

  <TokensTable
    on:nnsAction
    {userTokensData}
    firstColumnHeader={$i18n.tokens.projects_header}
  />
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
