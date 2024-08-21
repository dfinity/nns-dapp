<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { heightTransition } from "$lib/utils/transition.utils";
  import { IconPlus, IconSettings } from "@dfinity/gix-components";
  import { Popover } from "@dfinity/gix-components";
  import { nonNullish, TokenAmountV2 } from "@dfinity/utils";
  import { ENABLE_IMPORT_TOKEN } from "$lib/stores/feature-flags.store";
  import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";

  export let userTokensData: UserToken[];

  let settingsButton: HTMLButtonElement | undefined;
  let settingsPopupVisible = false;

  const openSettings = () => {
    settingsPopupVisible = true;
  };

  let shouldHideZeroBalances: boolean;
  $: shouldHideZeroBalances = $hideZeroBalancesStore === "hide";

  let nonZeroBalanceTokensData: UserToken[] = [];
  $: nonZeroBalanceTokensData = userTokensData.filter(
    (token) =>
      // Internet Computer is shown, even with zero balance.
      token.universeId.toText() === OWN_CANISTER_ID_TEXT ||
      (token.balance instanceof TokenAmountV2 && token.balance.toUlps() > 0n)
  );

  let shownTokensData: UserToken[] = [];
  $: shownTokensData = shouldHideZeroBalances
    ? nonZeroBalanceTokensData
    : userTokensData;

  const showAll = () => {
    hideZeroBalancesStore.set("show");
  };

  let shownImportTokenButton = false;
  $: shownImportTokenButton = nonNullish($importedTokensStore.importedTokens);

  let showImportTokenModal = false;

  // TODO(Import token): After removing ENABLE_IMPORT_TOKEN combine divs -> <div slot="last-row" class="last-row">
</script>

<TestIdWrapper testId="tokens-page-component">
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
    <div slot="last-row">
      {#if $ENABLE_IMPORT_TOKEN}
        <div class="last-row">
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

          {#if shownImportTokenButton}
            <button
              data-tid="import-token-button"
              class="ghost with-icon import-token-button"
              on:click={() => (showImportTokenModal = true)}
            >
              <IconPlus />{$i18n.import_token.import_token}
            </button>
          {/if}
        </div>
      {:else if shouldHideZeroBalances}
        <div
          class="show-all-row"
          transition:heightTransition={{ duration: 250 }}
        >
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
  <Popover
    bind:visible={settingsPopupVisible}
    anchor={settingsButton}
    direction="rtl"
    invisibleBackdrop
  >
    <HideZeroBalancesToggle />
  </Popover>

  {#if showImportTokenModal}
    <ImportTokenModal on:nnsClose={() => (showImportTokenModal = false)} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/effect";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

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

  // TODO(Import token): Remove after enabling ENABLE_IMPORT_TOKEN
  .show-all-row {
    color: var(--text-description);
    padding: var(--padding-2x);
    background: var(--table-row-background);

    button.show-all {
      text-decoration: underline;
    }
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
    }
  }
</style>
