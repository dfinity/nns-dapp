<script lang="ts">
  import { KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";
  import { depositFee as depositFeeService } from "$lib/services/ckbtc-minter.services";
  import { onMount } from "svelte";
  import type { CanisterId } from "$lib/types/canister";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";

  export let minterCanisterId: CanisterId;

  let kytFee: bigint | undefined | null = undefined;

  const loadKYTFee = async () => {
    const callback = (fee: bigint | null) => (kytFee = fee);

    await depositFeeService({
      minterCanisterId,
      callback,
    });
  };

  onMount(async () => await loadKYTFee());
</script>

<KeyValuePair testId="kyt-fee">
  <span slot="key" class="label">{$i18n.ckbtc.kyt_fee}</span>
  <svelte:fragment slot="value">
    {#if nonNullish(kytFee)}
      <span class="value">{formatEstimatedFee(kytFee)}</span>
      <span class="description">{$i18n.ckbtc.btc}</span>
    {/if}
  </svelte:fragment>
</KeyValuePair>

<style lang="scss">
  .description {
    margin-left: var(--padding);
  }
</style>
