<script lang="ts">
  import type { AccountsReceiveModalData } from "$lib/types/accounts.modal";
  import type { Account } from "$lib/types/account";
  import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import IC_LOGO from "$lib/assets/icp.svg";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";

  export let data: AccountsReceiveModalData;

  let account: Account | undefined;
  let reload: (() => Promise<void>) | undefined;
  let canSelectAccount: boolean;

  $: ({ account, reload, canSelectAccount } = data);

  let universeId: UniverseCanisterId | undefined;
  $: universeId = $snsOnlyProjectStore;

  let logo: string;
  $: logo = $selectedUniverseStore?.summary?.metadata.logo ?? IC_LOGO;

  let tokenSymbol: string | undefined;
  $: tokenSymbol = $selectedUniverseStore?.summary?.token.symbol;
</script>

{#if nonNullish(universeId) && nonNullish(tokenSymbol)}
  <ReceiveModal
    {account}
    on:nnsClose
    qrCodeLabel={replacePlaceholders($i18n.wallet.sns_qrcode_aria_label, {
      $tokenSymbol: tokenSymbol,
    })}
    {logo}
    logoArialLabel={tokenSymbol}
    {reload}
    {universeId}
    {canSelectAccount}
  >
    <svelte:fragment slot="address-label"
      >{replacePlaceholders($i18n.wallet.token_address, {
        $tokenSymbol: tokenSymbol,
      })}</svelte:fragment
    >
  </ReceiveModal>
{/if}
