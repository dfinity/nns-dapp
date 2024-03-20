<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { ENABLE_HIDE_ZERO_BALANCE } from "$lib/stores/feature-flags.store";
  import { IconSettings } from "@dfinity/gix-components";
  import { Popover } from "@dfinity/gix-components";

  export let userTokensData: UserToken[];

  let settingsButton: HTMLButtonElement | undefined;
  let settingsPopupVisible = false;

  const openSettings = () => {
    settingsPopupVisible = true;
  };
</script>

<TestIdWrapper testId="tokens-page-component">
  <TokensTable
    {userTokensData}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header}
  >
    <div slot="header-icon">
      {#if $ENABLE_HIDE_ZERO_BALANCE}
        <button
          data-tid="settings-button"
          class="settings-button icon-only"
          aria-label={$i18n.tokens.settings_button}
          bind:this={settingsButton}
          on:click={openSettings}><IconSettings /></button
        >
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
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  .settings-button {
    --content-color: var(--text-description);

    @include header.button(--primary-tint);
    margin: 0;
  }
</style>
