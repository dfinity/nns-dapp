<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";

  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;
</script>

<button
  class="secondary"
  type="button"
  on:click={() => store.update((data) => ({ ...data, modal: "rename" }))}
  data-tid="open-rename-subaccount-button"
>
  {$i18n.accounts.rename}
</button>
