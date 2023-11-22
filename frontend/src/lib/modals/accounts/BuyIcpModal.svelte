<script lang="ts">
  import { Html, Modal } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import BANXA_LOGO from "$lib/assets/banxa-logo.svg";
  import { getCurrentTheme } from "$lib/services/theme.services";

  export let account: Account;

  // TODO: Improve "light" colors
  const customStyleParams: Record<string, string> =
    getCurrentTheme() === "dark"
      ? {
          backgroundColor: "2a1a47",
          primaryColor: "9b6ef7",
          secondaryColor: "8b55f6",
          textColor: "ffffff",
        }
      : {
          backgroundColor: "cec4e8",
          primaryColor: "7350df",
          secondaryColor: "8c55f6",
          textColor: "ffffff",
        };

  let queryParams: Record<string, string | number>;
  $: queryParams = {
    fiatAmount: 100,
    fiatType: "USD",
    coinAmount: 0.00244394,
    coinType: "ICP",
    lockFiat: "true",
    blockchain: "BTC",
    orderMode: "BUY",
    ...customStyleParams,
    walletAddress: account?.identifier,
  };
  let url: string;
  $: url = `https://checkout.banxa.com/?${Object.entries(queryParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&")}`;
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
    <a
      class="button primary full-width with-icon"
      href={url}
      target="_blank"
      data-tid="buy-icp-banxa-button"
      ><img
        src={BANXA_LOGO}
        alt={$i18n.accounts.banxa_logo_alt}
        draggable="false"
      />{$i18n.accounts.buy_icp_banxa}</a
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

  a.button {
    box-sizing: border-box;

    padding: var(--padding) var(--padding-2x);

    border-radius: var(--border-radius);
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;

    position: relative;
    min-height: var(--button-min-height);

    font-weight: var(--font-weight-bold);
    text-decoration: none;

    &.primary {
      background: var(--primary);
      color: var(--primary-contrast);

      &:hover,
      &:focus {
        background: var(--primary-shade);
      }
    }
    &.full-width {
      width: 100%;
    }

    &.with-icon {
      @include button.with-icon;
    }
  }
</style>
