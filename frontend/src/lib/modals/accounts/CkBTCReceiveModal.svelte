<script lang="ts">
  import { KeyValuePair, Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { CkBTCWalletModalData } from "$lib/types/wallet.modal";
  import type { Account } from "$lib/types/account";

  export let data: CkBTCWalletModalData;

  let account: Account;
  let btcAddress: string;

  $: ({ account, btcAddress } = data);
</script>

<Modal testId="ckbtc-receive-modal" on:nnsClose>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  <KeyValuePair>
    <span slot="key" class="label">{$i18n.ckbtc.address}</span>
    <svelte:fragment slot="value">{btcAddress}</svelte:fragment>
  </KeyValuePair>

  <KeyValuePair>
    <span slot="key" class="label">{$i18n.ckbtc.address}</span>
    <svelte:fragment slot="value">{account.identifier}</svelte:fragment>
  </KeyValuePair>
</Modal>
