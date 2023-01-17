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

{#if nonNullish(balance)}
  <AmountDisplay text amount={balance} />
{:else}
  <div class="skeleton">
    <SkeletonText />
  </div>
{/if}

<style lang="scss">
  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-4x);
    box-sizing: border-box;
    padding: var(--padding-0_5x) 0;
    max-width: 240px;
  }
</style>
