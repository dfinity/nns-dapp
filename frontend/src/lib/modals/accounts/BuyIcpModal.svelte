<script lang="ts">
  import { Html, Modal } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import BANXA_LOGO from "$lib/assets/banxa-logo.svg";

  export let account: Account;

  const openBanxa = () => {
    window.open("https://banxa.com/", "_blank", "width=400,height=600");
  };
</script>

<Modal testId="buy-icp-modal-component" on:nnsClose>
  <span slot="title">{$i18n.accounts.buy_icp}</span>

  <div class="content">
    <div>
      <h2>{$i18n.accounts.icp_token_utility}</h2>
      <p><Html text={$i18n.accounts.buy_icp_description} /></p>
    </div>

    <p class="highlight"><Html text={$i18n.accounts.buy_icp_note} /></p>

    <div>
      <h3>{$i18n.accounts.receiving_icp_address}</h3>
      <IdentifierHash identifier={account?.identifier} />
    </div>
  </div>

  <div class="toolbar">
    <button
      class="primary full-width with-icon"
      on:click={openBanxa}
      data-tid="reload-receive-account"
      ><img
        src={BANXA_LOGO}
        alt={$i18n.accounts.banxa_logo_alt}
        draggable="false"
      />{$i18n.accounts.buy_icp_banxa}</button
    >
  </div>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/button";
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .highlight {
    background: var(--card-background-disabled);
    color: var(--text-description);

    padding: var(--padding-2x);
    border-radius: var(--border-radius);
  }

  button {
    @include button.with-icon;
  }
</style>
