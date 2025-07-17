<script lang="ts">
  import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
  import ImportTokenButton from "$lib/components/tokens/TokensTable/ImportTokenButton.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { tokensTableOrderStore } from "$lib/stores/tokens-table.store";
  import type { ImportedTokenData } from "$lib/types/imported-tokens";
  import type { UserToken } from "$lib/types/tokens-page";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { filterTokens } from "$lib/utils/tokens-table.utils";
  import { IconHeldTokens } from "@dfinity/gix-components";
  import { TokenAmountV2, isNullish } from "@dfinity/utils";

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
</script>

<div class="wrapper" data-tid="tokens-page-component">
  <UsdValueBanner usdAmount={totalBalanceInUsd} {hasUnpricedTokens}>
    <IconHeldTokens slot="icon" />
  </UsdValueBanner>

  <TokensTable
    userTokensData={filterTokens(shownTokensData, "icp")}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header_icp}
    bind:order={$tokensTableOrderStore}
    displayTableSettings
  >
    <svelte:fragment slot="settings-popover">
      <HideZeroBalancesToggle />
      <ImportTokenButton />
      <Separator spacing="none" />
    </svelte:fragment>

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
    </div>
  </TokensTable>

  <TokensTable
    userTokensData={filterTokens(shownTokensData, "ck")}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header_ck}
    bind:order={$tokensTableOrderStore}
  />

  <TokensTable
    userTokensData={filterTokens(shownTokensData, "sns")}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header_sns}
    bind:order={$tokensTableOrderStore}
  />

  {#if $importedTokensStore?.importedTokens?.length ?? 0 > 0}
    <TokensTable
      userTokensData={filterTokens(
        shownTokensData,
        "imported",
        $importedTokensStore.importedTokens
      )}
      on:nnsAction
      firstColumnHeader={$i18n.tokens.projects_header_imported}
      bind:order={$tokensTableOrderStore}
    />
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
