<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { heightTransition } from "$lib/utils/transition.utils";
  import { IconSettings } from "@dfinity/gix-components";
  import { Popover } from "@dfinity/gix-components";
  import { TokenAmountV2 } from "@dfinity/utils";

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
      {#if shouldHideZeroBalances}
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
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/effect";

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

  .show-all-row {
    color: var(--text-description);
    padding: var(--padding-2x);
    background: var(--table-row-background);

    button.show-all {
      text-decoration: underline;
    }
  }
</style>
