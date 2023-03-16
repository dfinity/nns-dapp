<script lang="ts">
  import type { AccountsReceiveModalData } from "$lib/types/accounts.modal";
  import type { Account } from "$lib/types/account";
  import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import IC_LOGO from "$lib/assets/icp.svg";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";

  export let data: AccountsReceiveModalData;

  let account: Account | undefined;
  let reloadAccount: (() => Promise<void>) | undefined;
  let canSelectAccount: boolean;

  $: ({ account, reloadAccount, canSelectAccount } = data);
</script>

<ReceiveModal
  {account}
  on:nnsClose
  qrCodeLabel={$i18n.wallet.icp_qrcode_aria_label}
  logo={IC_LOGO}
  logoArialLabel={$i18n.core.icp}
  {reloadAccount}
  universeId={OWN_CANISTER_ID}
  {canSelectAccount}
>
  <svelte:fragment slot="title"
    >{$i18n.wallet.icp_receive_note_title}</svelte:fragment
  >
  <svelte:fragment slot="description"
    >{$i18n.wallet.icp_receive_note_text}</svelte:fragment
  >
</ReceiveModal>
