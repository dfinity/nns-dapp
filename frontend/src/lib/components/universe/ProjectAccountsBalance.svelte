<script lang="ts">
  import { nonNullish } from "$lib/utils/utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import type { RootCanisterId } from "$lib/types/sns";
  import type { TokenAmount } from "@dfinity/nns";
  import { projectsAccountsBalance } from "$lib/derived/projects-accounts-balance.derived";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";

  export let rootCanisterId: RootCanisterId | undefined;

  let balance: TokenAmount | undefined;
  $: balance =
    $projectsAccountsBalance[(rootCanisterId ?? OWN_CANISTER_ID).toText()]
      ?.balance;
</script>

<div class="amount">
  {#if nonNullish(balance)}
    <AmountDisplay text amount={balance} />
  {:else}
    <div class="skeleton">
      <SkeletonText />
    </div>
  {/if}
</div>

<style lang="scss">
  .amount {
    min-height: var(--padding-3x);
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-3x);
    box-sizing: border-box;
    padding: 0 0 var(--padding-0_5x);
    max-width: 240px;
  }
</style>
