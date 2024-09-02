<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Popover } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";
  import LinkToDashboardCanister from "$lib/components/tokens/LinkToDashboardCanister.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let anchor: HTMLElement | undefined;
  export let visible: boolean | undefined;
  export let ledgerCanisterId: Principal | undefined;
  export let indexCanisterId: Principal | undefined;
</script>

<TestIdWrapper testId="wallet-more-popover-component">
  <Popover bind:visible {anchor} direction="rtl" invisibleBackdrop>
    <div class="content">
      {#if nonNullish(ledgerCanisterId)}
        <LinkToDashboardCanister
          testId="link-to-ledger-canister"
          label={$i18n.tokens.ledger_canister}
          canisterId={ledgerCanisterId}
        />
      {/if}
      {#if nonNullish(indexCanisterId)}
        <LinkToDashboardCanister
          testId="link-to-index-canister"
          label={$i18n.tokens.index_canister}
          canisterId={indexCanisterId}
        />
      {/if}
    </div>
  </Popover>
</TestIdWrapper>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
