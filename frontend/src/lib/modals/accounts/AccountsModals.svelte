<script lang="ts">
  import IcrcReceiveModal from "$lib/modals/accounts/IcrcReceiveModal.svelte";
  import NnsReceiveModal from "$lib/modals/accounts/NnsReceiveModal.svelte";
  import type { Account } from "$lib/types/account";
  import type {
    AccountsModal,
    AccountsModalData,
    AccountsModalType,
    AccountsReceiveModalData,
  } from "$lib/types/accounts.modal";
  import AddAccountModal from "./AddAccountModal.svelte";
  import BuyIcpModal from "./BuyIcpModal.svelte";
  import IcpTransactionModal from "./IcpTransactionModal.svelte";
  import { nonNullish } from "@dfinity/utils";

  let modal:
    | AccountsModal<AccountsReceiveModalData | AccountsModalData>
    | undefined;
  const close = () => (modal = undefined);

  let type: AccountsModalType | undefined;
  $: type = modal?.type;

  let data: AccountsReceiveModalData | undefined;
  $: data = (modal as AccountsModal<AccountsReceiveModalData> | undefined)
    ?.data;

  let account: Account | undefined;
  $: account = (modal as AccountsModal<AccountsModalData> | undefined)?.data
    ?.account;

  const onNnsAccountsModal = ({
    detail,
  }: CustomEvent<
    AccountsModal<AccountsReceiveModalData | AccountsModalData>
  >) => (modal = detail);
</script>

<svelte:window on:nnsAccountsModal={onNnsAccountsModal} />

{#if type === "buy-icp" && nonNullish(account)}
  <BuyIcpModal on:nnsClose={close} {account} />
{/if}

{#if type === "nns-receive" && nonNullish(data)}
  <NnsReceiveModal on:nnsClose={close} {data} />
{/if}

{#if type === "nns-send"}
  <IcpTransactionModal on:nnsClose={close} selectedAccount={account} />
{/if}

{#if type === "icrc-receive" && nonNullish(data)}
  <IcrcReceiveModal on:nnsClose={close} {data} />
{/if}

{#if type === "add-icp-account"}
  <AddAccountModal on:nnsClose={close} />
{/if}
