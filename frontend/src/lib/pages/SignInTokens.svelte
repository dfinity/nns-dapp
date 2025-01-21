<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { IconAccountsPage, PageBanner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ENABLE_IMPORT_TOKEN_BY_URL } from "$lib/stores/feature-flags.store";
  import { pageStore } from "$lib/derived/page.derived";

  export let userTokensData: UserToken[];

  // Since there are two ImportTokenModals on both Tokens and SignInTokens pages,
  // we need to hide this modal after a successful sign-in to
  // prevent it from blocking this component’s destruction.
  let showImportTokenModal = false;
  $: showImportTokenModal =
    !$authSignedInStore && nonNullish($pageStore.importTokenLedgerId);
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

  {#if showImportTokenModal && $ENABLE_IMPORT_TOKEN_BY_URL}
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
