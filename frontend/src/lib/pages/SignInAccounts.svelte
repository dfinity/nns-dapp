<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { PageBanner, IconAccountsPage } from "@dfinity/gix-components";

  export let userTokensData: UserTokenData[] = [];
</script>

{#if $ENABLE_MY_TOKENS}
  <div class="content" data-tid="accounts-landing-page">
    <PageBanner>
      <IconAccountsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.auth_accounts.title}</svelte:fragment
      >
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
{:else}
  <main data-tid="accounts-landing-page">
    <SummaryUniverse />

    <div class="content">
      <PageBanner>
        <IconAccountsPage slot="image" />
        <svelte:fragment slot="title"
          >{$i18n.auth_accounts.title}</svelte:fragment
        >
        <p class="description" slot="description">{$i18n.auth_accounts.text}</p>
        <SignIn slot="actions" />
      </PageBanner>

      <EmptyCards />
    </div>
  </main>
{/if}

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
