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
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let userTokensData: UserToken[];
  let showImportTokenModal = false;
  $: showImportTokenModal =
    ENABLE_IMPORT_TOKEN_BY_URL &&
    // Since there are two ImportTokenModals on both Tokens and SignInTokens pages,
    // we need to hide this modal after a successful sign-in to
    // prevent it from blocking this component’s destruction.
    !$authSignedInStore &&
    nonNullish($pageStore.importTokenLedgerId);
</script>

<TestIdWrapper testId="sign-in-tokens-page-component">
  <div class="content">
    <PageBanner>
      <IconAccountsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.auth_accounts.title}</svelte:fragment
      >
      <p class="description" slot="description">{$i18n.auth_accounts.text}</p>
      <SignIn slot="actions" />
    </PageBanner>

    <TokensTable
      on:nnsAction
      {userTokensData}
      firstColumnHeader={$i18n.tokens.projects_header}
    />
  </div>

  {#if showImportTokenModal}
    <ImportTokenModal on:nnsClose={() => (showImportTokenModal = false)} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
