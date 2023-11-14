<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { PageBanner, IconAccountsPage } from "@dfinity/gix-components";

  export let userTokensData: UserTokenData[];
</script>

<main class="sign-in" data-tid="sign-in-tokens-page-component">
  <div class="content">
    <PageBanner>
      <IconAccountsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.auth_accounts.title}</svelte:fragment
      >
      <p class="description" slot="description">{$i18n.auth_accounts.text}</p>
      <SignIn slot="actions" />
    </PageBanner>

    <TokensTable {userTokensData} />
  </div>
</main>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
