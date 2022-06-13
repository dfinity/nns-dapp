<script lang="ts">
  import { accountName as getAccountName } from "../../utils/transactions.utils";
  import { i18n } from "../../stores/i18n";
  import ICP from "../ic/ICP.svelte";
  import Identifier from "../ui/Identifier.svelte";
  import { isAccountHardwareWallet } from "../../utils/accounts.utils";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "../../types/selected-account.context";

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let accountName: string;
  $: accountName = getAccountName({
    account: $store.account,
    mainName: $i18n.accounts.main,
  });
</script>

<div class="title">
  <h1>{accountName}</h1>
  <ICP icp={$store.account.balance} />
</div>
<div class="address">
  <Identifier
    identifier={$store.account.identifier}
    label={$i18n.wallet.address}
    showCopy
    size="medium"
  />
  {#if isAccountHardwareWallet($store.account)}
    <Identifier
      identifier={$store.account.principal?.toString() ?? ""}
      label={$i18n.wallet.principal}
      showCopy
    />
  {/if}
</div>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  .title {
    display: block;
    width: 100%;

    margin: var(--padding-2x) 0;

    --icp-font-size: var(--font-size-h1);

    // Minimum height of ICP value + ICP label (ICP component)
    min-height: calc(
      var(--line-height-standard) * (var(--icp-font-size) + 1rem)
    );

    @include media.min-width(medium) {
      display: inline-flex;
      justify-content: space-between;
      align-items: baseline;
    }
  }

  .address {
    margin-bottom: var(--padding-4x);
    :global(p:first-of-type) {
      color: var(--gray-50);
      margin-bottom: var(--padding);
    }
  }
</style>
