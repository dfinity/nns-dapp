<script lang="ts">
  import type {
    AccountsModal,
    AccountsModalType,
    AccountsReceiveModalData,
  } from "$lib/types/accounts.modal";
  import NnsReceiveModal from "$lib/modals/accounts/NnsReceiveModal.svelte";
  import { nonNullish } from "@dfinity/utils";
  import SnsReceiveModal from "$lib/modals/accounts/SnsReceiveModal.svelte";

  let modal: AccountsModal | undefined;
  const close = () => (modal = undefined);

  let type: AccountsModalType | undefined;
  $: type = modal?.type;

  let data: AccountsReceiveModalData | undefined;
  $: data = (modal as AccountsModal | undefined)?.data;

  const onNnsAccountsModal = ({ detail }: CustomEvent<AccountsModal>) =>
    (modal = detail);
</script>

<svelte:window on:nnsAccountsModal={onNnsAccountsModal} />

{#if type === "nns-receive" && nonNullish(data)}
  <NnsReceiveModal on:nnsClose={close} {data} />
{/if}

{#if type === "sns-receive" && nonNullish(data)}
  <SnsReceiveModal on:nnsClose={close} {data} />
{/if}
