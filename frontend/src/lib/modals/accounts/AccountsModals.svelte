<script lang="ts">
  import type {
    AccountsModal,
    AccountsModalType,
    AccountsReceiveModalData,
  } from "$lib/types/accounts.modal";
  import NnsReceiveModal from "$lib/modals/accounts/NnsReceiveModal.svelte";
  import { nonNullish } from "@dfinity/utils";
  import SnsReceiveModal from "$lib/modals/accounts/SnsReceiveModal.svelte";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import IC_LOGO from "$lib/assets/icp.svg";
  import BuyIcpModal from "./BuyIcpModal.svelte";
  import type { Account } from "$lib/types/account";

  let modal: AccountsModal | undefined;
  const close = () => (modal = undefined);

  let type: AccountsModalType | undefined;
  $: type = modal?.type;

  let data: AccountsReceiveModalData | undefined;
  $: data = (modal as AccountsModal | undefined)?.data;

  let account: Account | undefined;
  $: account = (modal as AccountsModal | undefined)?.data?.account;

  const onNnsAccountsModal = ({ detail }: CustomEvent<AccountsModal>) =>
    (modal = detail);
</script>

<svelte:window on:nnsAccountsModal={onNnsAccountsModal} />

{#if type === "buy-icp" && nonNullish(account)}
  <BuyIcpModal on:nnsClose={close} {account} />
{/if}

{#if type === "nns-receive" && nonNullish(data)}
  <NnsReceiveModal on:nnsClose={close} {data} />
{/if}

{#if type === "sns-receive" && nonNullish(data)}
  <SnsReceiveModal
    on:nnsClose={close}
    {data}
    universeId={$snsOnlyProjectStore}
    logo={$selectedUniverseStore?.summary?.metadata.logo ?? IC_LOGO}
    tokenSymbol={$selectedUniverseStore?.summary?.token.symbol}
  />
{/if}
