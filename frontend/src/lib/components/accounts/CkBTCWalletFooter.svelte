<script lang="ts">
  import CkBTCReceiveButton from "$lib/components/accounts/CkBTCReceiveButton.svelte";
  import CkBTCSendButton from "$lib/components/accounts/CkBTCSendButton.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { busy } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { Writable } from "svelte/store";

  export let store: Writable<WalletStore>;
  export let reloadAccount: () => Promise<void>;
  export let reloadAccountFromStore: () => void;

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

<Footer testId="ckbtc-wallet-footer-component">
  <CkBTCSendButton
    {disableButton}
    {canisters}
    account={$store.account}
    {reloadAccountFromStore}
    loadTransactions
  />

  <CkBTCReceiveButton
    {disableButton}
    {canisters}
    account={$store.account}
    reload={reloadAccount}
  />
</Footer>
