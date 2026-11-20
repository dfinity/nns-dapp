<script lang="ts">
  import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
  import ImportTokenButton from "$lib/components/tokens/TokensTable/ImportTokenButton.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import {
    abandonedProjectsCanisterId,
    OWN_CANISTER_ID_TEXT,
  } from "$lib/constants/canister-ids.constants";
  import { pageStore } from "$lib/derived/page.derived";
  import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
  import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { tokensTableOrderStore } from "$lib/stores/tokens-table.store";
  import type { ImportedTokenData } from "$lib/types/imported-tokens";
  import type { UserToken } from "$lib/types/tokens-page";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { filterTokensByType } from "$lib/utils/tokens-table.utils";
  import { IconHeldTokens } from "$lib/gix";
  import { isNullish, nonNullish, TokenAmountV2 } from "@dfinity/utils";

  export let userTokensData: UserToken[];
  export let universeOrder: string[] = [];

  let totalBalanceInUsd: number;
  $: totalBalanceInUsd = getTotalBalanceInUsd(userTokensData);

  let hasUnpricedTokens: boolean;
  $: hasUnpricedTokens = userTokensData.some(
    (token) =>
      token.balance instanceof TokenAmountV2 &&
      token.balance.toUlps() > 0n &&
      (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
  );

  let shouldHideZeroBalances: boolean;
  $: shouldHideZeroBalances = $hideZeroBalancesStore === "hide";

  const getNonZeroBalanceTokensData = ({
    userTokensData,
    importedTokens,
  }: {
    userTokensData: UserToken[];
    importedTokens: ImportedTokenData[] | undefined;
  }) =>
    userTokensData.filter(
      (token) =>
        // Internet Computer is shown, even with zero balance.
        token.universeId.toText() === OWN_CANISTER_ID_TEXT ||
        // Imported tokens are shown, even with zero balance.
        isImportedToken({
          ledgerCanisterId: token.universeId,
          importedTokens,
        }) ||
        (token.balance instanceof TokenAmountV2 && token.balance.toUlps() > 0n)
    );
  let nonZeroBalanceTokensData: UserToken[] = [];
  $: nonZeroBalanceTokensData = getNonZeroBalanceTokensData({
    userTokensData,
    importedTokens: $importedTokensStore.importedTokens,
  });

  let shownTokensData: UserToken[] = [];
  $: shownTokensData = shouldHideZeroBalances
    ? nonZeroBalanceTokensData
    : userTokensData;

  let icpTokensData: UserToken[] = [];
  $: icpTokensData = filterTokensByType({
    tokens: shownTokensData,
    type: "icp",
  });

  let ckTokensData: UserToken[] = [];
  $: ckTokensData = filterTokensByType({ tokens: shownTokensData, type: "ck" });

  let importedTokensData: UserToken[] = [];
  $: importedTokensData = filterTokensByType({
    tokens: shownTokensData,
    type: "imported",
    importedTokens: $importedTokensStore.importedTokens,
  });

  let snsTokensData: UserToken[] = [];
  $: snsTokensData = filterTokensByType({
    tokens: shownTokensData,
    type: "sns",
    importedTokens: $importedTokensStore.importedTokens,
  }).filter(
    (token) => !abandonedProjectsCanisterId.includes(token.universeId.toText())
  );

  const showAll = () => {
    hideZeroBalancesStore.set("show");
  };

  let showImportTokenModal = false;
</script>

<div class="wrapper" data-tid="tokens-page-component">
  <UsdValueBanner usdAmount={totalBalanceInUsd} {hasUnpricedTokens}>
    <IconHeldTokens slot="icon" />
  </UsdValueBanner>

  <TokensTable
    userTokensData={icpTokensData}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header_icp}
    subtitle={$i18n.tokens.projects_header_icp_subtitle}
    bind:order={$tokensTableOrderStore}
    displayTableSettings
    testId="icp-tokens-table-component"
    {universeOrder}
  >
    <svelte:fragment slot="settings-popover">
      <HideZeroBalancesToggle />
      <ImportTokenButton bind:isModalVisible={showImportTokenModal} />
      <Separator spacing="none" />
    </svelte:fragment>

    <div slot="last-row" class:last-row={shouldHideZeroBalances}>
      {#if shouldHideZeroBalances}
        <div class="show-all-button-container">
          {$i18n.tokens.zero_balance_hidden}
          <button
            data-tid="show-all-button"
            class="ghost show-all"
            on:click={showAll}
          >
            {$i18n.tokens.show_all}</button
          >
        </div>
      {/if}
    </div>
  </TokensTable>

  {#if ckTokensData.length > 0}
    <TokensTable
      userTokensData={ckTokensData}
      on:nnsAction
      firstColumnHeader={$i18n.tokens.projects_header_ck}
      subtitle={$i18n.tokens.projects_header_ck_subtitle}
      bind:order={$tokensTableOrderStore}
      displayTableSettings
      testId="ck-tokens-table-component"
      {universeOrder}
    >
      <svelte:fragment slot="settings-popover">
        <HideZeroBalancesToggle />
        <ImportTokenButton bind:isModalVisible={showImportTokenModal} />
        <Separator spacing="none" />
      </svelte:fragment>
    </TokensTable>
  {/if}

  {#if snsTokensData.length > 0}
    <TokensTable
      userTokensData={snsTokensData}
      on:nnsAction
      firstColumnHeader={$i18n.tokens.projects_header_sns}
      subtitle={$i18n.tokens.projects_header_sns_subtitle}
      bind:order={$tokensTableOrderStore}
      displayTableSettings
      testId="sns-tokens-table-component"
      {universeOrder}
    >
      <svelte:fragment slot="settings-popover">
        <HideZeroBalancesToggle />
        <ImportTokenButton bind:isModalVisible={showImportTokenModal} />
        <Separator spacing="none" />
      </svelte:fragment>
    </TokensTable>
  {/if}

  {#if importedTokensData.length > 0}
    <TokensTable
      userTokensData={importedTokensData}
      on:nnsAction
      firstColumnHeader={$i18n.tokens.projects_header_imported}
      subtitle={$i18n.tokens.projects_header_imported_subtitle}
      bind:order={$tokensTableOrderStore}
      displayTableSettings
      testId="imported-tokens-table-component"
      {universeOrder}
    >
      <svelte:fragment slot="settings-popover">
        <HideZeroBalancesToggle />
        <ImportTokenButton bind:isModalVisible={showImportTokenModal} />
        <Separator spacing="none" />
      </svelte:fragment>
    </TokensTable>
  {/if}

  {#if showImportTokenModal || nonNullish($pageStore.importTokenLedgerId)}
    <ImportTokenModal on:nnsClose={() => (showImportTokenModal = false)} />
  {/if}
</div>

<style lang="scss">
  @use "../gix/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(large) {
      column-gap: var(--padding-2x);
      row-gap: var(--padding-3x);
    }
  }

  [slot="last-row"] {
    grid-column: 1 / -1;
  }

  .last-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding-2x);

    padding: calc(3 * var(--padding)) var(--padding-2x);
    background: var(--table-row-background);
    border-top: 1px solid var(--elements-divider);
    text-align: center;

    @include media.min-width(medium) {
      flex-direction: row;
      justify-content: space-between;
      padding: var(--padding-2x);
      text-align: left;
      gap: var(--padding);

      .show-all-button-container {
        // Show-all button should be on right on desktop.
        order: 1;
      }
    }

    .show-all-button-container {
      color: var(--text-description);
      background: var(--table-row-background);

      button.show-all {
        text-decoration: underline;
      }
    }
  }
</style>
