<script lang="ts">
  import type { AccountsReceiveModalData } from "$lib/types/accounts.modal";
  import type { Account } from "$lib/types/account";
  import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import IC_LOGO from "$lib/assets/icp.svg";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let data: AccountsReceiveModalData;

  let account: Account | undefined;
  let reload: (() => Promise<void>) | undefined;
  let canSelectAccount: boolean;

  $: ({ account, reload, canSelectAccount } = data);
</script>

<ReceiveModal
  {account}
  on:nnsClose
  qrCodeLabel={$i18n.wallet.icp_qrcode_aria_label}
  logo={IC_LOGO}
  logoArialLabel={$i18n.core.icp}
  {reload}
  universeId={OWN_CANISTER_ID}
  {canSelectAccount}
>
  <svelte:fragment slot="address-label"
    >{replacePlaceholders($i18n.wallet.token_address, {
      $tokenSymbol: $i18n.core.icp,
    })}</svelte:fragment
  >
</ReceiveModal>
