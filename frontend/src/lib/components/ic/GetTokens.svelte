<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { getTestBalance } from "$lib/services/dev.services";
  import { IconAccountBalance } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import {
    isCkBTCUniverseStore,
    selectedIcrcTokenUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { Principal } from "@dfinity/principal";
  import { ICPToken, nonNullish } from "@dfinity/utils";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { browser } from "$app/environment";
  import { getIcrcTokenTestAccountBalance } from "$lib/api/dev.api";
  import { tokensStore } from "$lib/stores/tokens.store";
  import GetTokensModal from "./GetTokensModal.svelte";

  let visible = false;

  let snsSelectedProjectId: Principal | undefined;
  $: snsSelectedProjectId = $snsOnlyProjectStore;

  let icrcSelectedProjectId: Principal | undefined;
  $: icrcSelectedProjectId = $selectedIcrcTokenUniverseIdStore;

  const close = () => {
    visible = false;
  };

  // Check the balance of the test account in that universe.
  let tokenBalanceE8s = 0n;
  $: snsSelectedProjectId,
    (async () => {
      // This was executed at build time and it depends on `window` in `base64ToUInt8Array` helper inside dev.api.ts
      if (browser) {
        if (nonNullish(snsSelectedProjectId)) {
          tokenBalanceE8s = await getTestBalance(snsSelectedProjectId);
        }
        if (nonNullish(icrcSelectedProjectId)) {
          tokenBalanceE8s = await getIcrcTokenTestAccountBalance(
            icrcSelectedProjectId
          );
        }
      }
    })();

  // If the SNS test account balance is 0, don't show a button that won't work. Show the ICP token instead.
  let tokenSymbol: string;
  $: tokenSymbol =
    nonNullish(icrcSelectedProjectId) &&
    $tokensStore[icrcSelectedProjectId?.toText()]?.token &&
    tokenBalanceE8s > 0n
      ? $tokensStore[icrcSelectedProjectId?.toText()].token.symbol
      : nonNullish(snsSelectedProjectId) && tokenBalanceE8s > 0n
      ? $snsTokenSymbolSelectedStore?.symbol ?? ICPToken.symbol
      : $isCkBTCUniverseStore
      ? $i18n.ckbtc.btc
      : ICPToken.symbol;

  let buttonTestId: string;
  $: buttonTestId =
    nonNullish(snsSelectedProjectId) && tokenBalanceE8s > 0n
      ? "get-sns-button"
      : $isCkBTCUniverseStore
      ? "get-btc-button"
      : "get-icp-button";
</script>

<TestIdWrapper testId="get-tokens-component">
  {#if $authSignedInStore}
    <button
      role="menuitem"
      data-tid={buttonTestId}
      on:click|preventDefault|stopPropagation={() => (visible = true)}
      class="open"
      title={`Get ${tokenSymbol}`}
    >
      <IconAccountBalance />
      <span>{`Get ${tokenSymbol}`}</span>
    </button>
  {/if}

  {#if visible}
    <GetTokensModal {tokenSymbol} on:nnsClose={close} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .open {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    @include fonts.h5;

    color: var(--menu-color);

    padding: var(--padding-2x);

    &:focus,
    &:hover {
      color: var(--menu-select-color);
    }

    span {
      margin: 0 var(--padding) 0 var(--padding-2x);
    }

    z-index: var(--z-index);

    :global(svg) {
      width: var(--padding-3x);
      min-width: var(--padding-3x);
      height: var(--padding-3x);
    }

    span {
      white-space: nowrap;
    }
  }
</style>
