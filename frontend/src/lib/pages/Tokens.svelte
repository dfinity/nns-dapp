<script lang="ts">
  import { page } from "$app/stores";
  import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { MAX_IMPORTED_TOKENS } from "$lib/constants/imported-tokens.constants";
  import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
  import { ENABLE_USD_VALUES } from "$lib/stores/feature-flags.store";
  import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import type { ImportedTokenData } from "$lib/types/imported-tokens";
  import type { UserToken } from "$lib/types/tokens-page";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import {
    IconAccountsPage,
    IconPlus,
    IconSettings,
    Popover,
    Tooltip,
  } from "@dfinity/gix-components";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";

  export let userTokensData: UserToken[];

  let totalBalanceInUsd: number;
  $: totalBalanceInUsd = getTotalBalanceInUsd(userTokensData);

  let hasUnpricedTokens: boolean;
  $: hasUnpricedTokens = userTokensData.some(
    (token) =>
      token.balance instanceof TokenAmountV2 &&
      token.balance.toUlps() > 0n &&
      (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
  );

  let settingsButton: HTMLButtonElement | undefined;
  let settingsPopupVisible = false;

  const openSettings = () => {
    settingsPopupVisible = true;
  };

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

  const showAll = () => {
    hideZeroBalancesStore.set("show");
  };

  let showImportTokenModal = false;
  let maximumImportedTokensReached = false;
  $: maximumImportedTokensReached =
    ($importedTokensStore.importedTokens?.length ?? 0) >= MAX_IMPORTED_TOKENS;

  let hasImportedTokenLedgerCanisterId = false;
  $: hasImportedTokenLedgerCanisterId = nonNullish(
    $page.url.searchParams.get("import-ledger-id")
  );
</script>

<div class="wrapper" data-tid="tokens-page-component">
  {#if $ENABLE_USD_VALUES}
    <UsdValueBanner usdAmount={totalBalanceInUsd} {hasUnpricedTokens}>
      <IconAccountsPage slot="icon" />
    </UsdValueBanner>
  {/if}

  <TokensTable
    userTokensData={shownTokensData}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header}
  >
    <div slot="header-icon">
      <button
        data-tid="settings-button"
        class="settings-button icon-only"
        aria-label={$i18n.tokens.settings_button}
        bind:this={settingsButton}
        on:click={openSettings}><IconSettings /></button
      >
    </div>
    <div slot="last-row" class="last-row">
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

      {#if nonNullish($importedTokensStore.importedTokens)}
        <Tooltip
          top
          testId="maximum-imported-tokens-tooltip"
          text={maximumImportedTokensReached
            ? replacePlaceholders($i18n.import_token.maximum_reached_tooltip, {
                $max: `${MAX_IMPORTED_TOKENS}`,
              })
            : undefined}
        >
          <button
            data-tid="import-token-button"
            class="ghost with-icon import-token-button"
            on:click={() => (showImportTokenModal = true)}
            disabled={maximumImportedTokensReached}
          >
            <IconPlus />{$i18n.import_token.import_token}
          </button>
        </Tooltip>
      {/if}
    </div>
  </TokensTable>
  <Popover
    bind:visible={settingsPopupVisible}
    anchor={settingsButton}
    direction="rtl"
    invisibleBackdrop
  >
    <HideZeroBalancesToggle />
  </Popover>

  {#if showImportTokenModal || hasImportedTokenLedgerCanisterId}
    <ImportTokenModal on:nnsClose={() => (showImportTokenModal = false)} />
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/effect";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .settings-button {
    --content-color: var(--text-description);

    @include effect.ripple-effect(--primary-tint, var(--primary-contrast));

    &:focus {
      background: var(--primary-tint);
      @include effect.ripple-effect(--primary-tint, var(--primary-contrast));
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

    .import-token-button {
      gap: var(--padding);
      color: var(--primary);

      &:disabled {
        color: var(--button-disable-color);
      }
    }
  }
</style>
