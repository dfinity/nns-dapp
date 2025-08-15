<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
  import { ENABLE_NEW_TABLES } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { filterTokensByType } from "$lib/utils/tokens-table.utils";
  import { IconAccountsPage, PageBanner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    userTokensData: UserToken[];
  };
  const { userTokensData = [] }: Props = $props();

  // Since there are two ImportTokenModals on both Tokens and SignInTokens pages,
  // we need to hide this modal after a successful sign-in to
  // prevent it from blocking this component’s destruction.
  let showImportTokenModal = $state(
    !$authSignedInStore && nonNullish($pageStore.importTokenLedgerId)
  );
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
    {#if $ENABLE_NEW_TABLES}
      <TokensTable
        on:nnsAction
        userTokensData={filterTokensByType({
          tokens: userTokensData,
          type: "icp",
        })}
        firstColumnHeader={$i18n.tokens.projects_header_icp}
        subtitle={$i18n.tokens.projects_header_icp_subtitle}
      />
      <TokensTable
        on:nnsAction
        userTokensData={filterTokensByType({
          tokens: userTokensData,
          type: "ck",
        })}
        firstColumnHeader={$i18n.tokens.projects_header_ck}
        subtitle={$i18n.tokens.projects_header_ck_subtitle}
      />
      <TokensTable
        on:nnsAction
        userTokensData={filterTokensByType({
          tokens: userTokensData,
          type: "sns",
        }).filter(
          (token) =>
            !abandonedProjectsCanisterId.includes(token.universeId.toText())
        )}
        firstColumnHeader={$i18n.tokens.projects_header_sns}
        subtitle={$i18n.tokens.projects_header_sns_subtitle}
      />
    {:else}
      <TokensTable
        on:nnsAction
        {userTokensData}
        firstColumnHeader={$i18n.tokens.projects_header}
      />
    {/if}
  </div>
  {#if showImportTokenModal}
    <ImportTokenModal on:nnsClose={() => (showImportTokenModal = false)} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(large) {
      column-gap: var(--padding-2x);
      row-gap: var(--padding-3x);
    }
  }
</style>
