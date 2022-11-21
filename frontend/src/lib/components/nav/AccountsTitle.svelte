<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { INTERNET_COMPUTER, IC_LOGO } from "$lib/constants/icp.constants";
  import {
    ENABLE_SNS,
  } from "$lib/constants/environment.constants";
  import SelectProjectDropdownHeader from "$lib/components/nav/SelectProjectDropdownHeader.svelte";

  export let balance: TokenAmount | undefined;
  export let logo = IC_LOGO;
  export let title = INTERNET_COMPUTER;

  let totalTokens: string;
  $: totalTokens =
    balance !== undefined
      ? formatToken({
          value: balance.toE8s(),
          detailed: true,
        })
      : "";
</script>

<div class="summary" data-tid="accounts-summary">
  <Logo src={logo} alt="" size="big" framed={false} testId="accounts-logo" />

  {#if ENABLE_SNS}
    <SelectProjectDropdownHeader />
    {:else}
    <h1 data-tid="accounts-title">{title}</h1>
  {/if}

  {#if balance !== undefined}
    <div class="total" class:sns={ENABLE_SNS}>
      <Tooltip
              id="wallet-total-icp"
              text={replacePlaceholders($i18n.accounts.current_balance_total, {
        $amount: totalTokens,
      })}
      >
        <AmountDisplay inline amount={balance} />
      </Tooltip>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/text";

  .summary {
    display: grid;
    grid-template-columns: repeat(2, auto);

    margin: var(--padding) 0 var(--padding-3x);
    --amount-color: var(--content-color);

    column-gap: var(--padding-2x);

    width: fit-content;
    max-width: 100%;

    word-break: break-all;

    :global(img) {
      grid-row-start: 1;
      grid-row-end: 3;
    }
  }

  .total {
    &.sns {
      margin-left: var(--padding-2x);
    }
  }

  h1 {
    display: inline-block;
    @include text.truncate;
  }
</style>
