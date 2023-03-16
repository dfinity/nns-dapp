<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import {
    WALLET_CONTEXT_KEY,
    type CkBTCWalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";
  import { busy } from "@dfinity/gix-components";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import CkBTCReceive from "$lib/components/accounts/CkBTCReceive.svelte";
  import CkBTCSend from "$lib/components/accounts/CkBTCSend.svelte";

  const context: CkBTCWalletContext =
    getContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY);
  const { store, reloadAccount, reloadAccountFromStore }: CkBTCWalletContext =
    context;

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let disableButton = true;
  $: disableButton =
    isNullish($store.account) ||
    isNullish($selectedCkBTCUniverseIdStore) ||
    isNullish(canisters) ||
    $busy;
</script>

<Footer columns={2}>
  <CkBTCSend
    {disableButton}
    {canisters}
    account={$store.account}
    {reloadAccountFromStore}
    loadTransactions
  />

  <CkBTCReceive
    {disableButton}
    {canisters}
    account={$store.account}
    {reloadAccount}
  />
</Footer>
