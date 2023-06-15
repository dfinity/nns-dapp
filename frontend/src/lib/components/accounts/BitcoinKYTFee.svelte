<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
  import {
    ckBTCInfoStore,
    type CkBTCInfoStoreUniverseData,
  } from "$lib/stores/ckbtc-info.store";
  import type { UniverseCanisterId } from "$lib/types/universe";

  export let universeId: UniverseCanisterId;

  let infoData: CkBTCInfoStoreUniverseData | undefined = undefined;
  $: infoData = $ckBTCInfoStore[universeId.toText()];

  let kytFee: bigint | undefined = undefined;
  $: kytFee = infoData?.info.kyt_fee;
</script>

{#if nonNullish(kytFee)}
  <p class="fee label no-margin" data-tid="kyt-estimated-fee-label">
    {$i18n.accounts.estimated_internetwork_fee}
  </p>

  <p class="no-margin" data-tid="kyt-estimated-fee">
    <span class="value tabular-num">{formatEstimatedFee(kytFee)}</span>
    <span class="label">{$i18n.ckbtc.btc}</span>
  </p>
{/if}

<style lang="scss">
  .fee {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }
</style>
