<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import AccountDetails from "$lib/components/header/AccountDetails.svelte";
  import LinkToAddressBook from "$lib/components/header/LinkToAddressBook.svelte";
  import LinkToCanisters from "$lib/components/header/LinkToCanisters.svelte";
  import LinkToReporting from "$lib/components/header/LinkToReporting.svelte";
  import LinkToSettings from "$lib/components/header/LinkToSettings.svelte";
  import Logout from "$lib/components/header/Logout.svelte";
  import ManageInternetIdentityButton from "$lib/components/header/ManageInternetIdentityButton.svelte";
  import ToggleBalancePrivacyOption from "$lib/components/header/ToggleBalancePrivacyOption.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { login } from "$lib/services/auth.services";
  import { i18n } from "$lib/stores/i18n";
  import { layoutAuthReady } from "$lib/stores/layout.store";
  import { IconLogin, IconUser, Popover } from "@dfinity/gix-components";

  let visible = false;
  let button: HTMLButtonElement | undefined;

  const toggle = () => (visible = !visible);
  const closeMenu = () => (visible = false);
</script>

<TestIdWrapper testId="account-menu-component">
  {#if $authSignedInStore}
    <button
      aria-label={$i18n.header.account_menu}
      class="icon-only toggle"
      data-tid="account-menu"
      bind:this={button}
      on:click={toggle}
    >
      <IconUser />
    </button>

    <Popover bind:visible anchor={button} direction="rtl">
      <div class="info">
        <AccountDetails />

        <ToggleBalancePrivacyOption />

        <ManageInternetIdentityButton />

        <LinkToSettings on:nnsLink={closeMenu} />

        <LinkToAddressBook on:nnsLink={closeMenu} />

        <LinkToCanisters on:nnsLink={closeMenu} />

        <LinkToReporting on:nnsLink={closeMenu} />

        <Logout on:nnsLogoutTriggered={toggle} />
      </div>
    </Popover>
  {:else}
    <button
      class="icon-only toggle"
      aria-label={$i18n.auth.login}
      disabled={!$layoutAuthReady}
      data-tid="toolbar-login"
      on:click={login}
    >
      <IconLogin />
    </button>
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  .info {
    flex-direction: column;
    gap: var(--padding-3x);
    display: flex;
    width: 100%;
  }

  .toggle,
  :global([data-tid="menu-toggle"]) {
    @include header.button(--primary-tint);
    background-color: var(--sidebar-button-background);
    min-width: 0 !important;
    height: 28px !important;
    width: 28px !important;
  }
</style>
