<script lang="ts">
  import SnsWalletBalancesObserver from "$lib/components/accounts/SnsWalletBalancesObserver.svelte";
  import { writable } from "svelte/store";
  import {
    WALLET_CONTEXT_KEY,
    WalletContext,
    WalletStore,
  } from "$lib/types/wallet.context";
  import { setContext } from "svelte";
  import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";

  export const walletStore = writable<WalletStore>({
    account: mockSnsMainAccount,
    neurons: [],
  });

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: walletStore,
  });
</script>

<SnsWalletBalancesObserver>
  <div data-tid="test-observer" />
</SnsWalletBalancesObserver>
