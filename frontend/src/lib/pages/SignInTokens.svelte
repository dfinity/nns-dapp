<script lang="ts">
  import { page } from "$app/stores";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { IconAccountsPage, PageBanner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  export let userTokensData: UserToken[];

  // Make a derived store out of it
  let showImportTokenModal = false;
  $: showImportTokenModal =
    nonNullish($page.url.searchParams.get("import-ledger-id")) &&
    !$authSignedInStore;
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

  {#if showImportTokenModal}
    <ImportTokenModal on:nnsClose={() => (showImportTokenModal = false)} />
  {/if}
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
