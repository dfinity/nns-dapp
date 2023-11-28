<script lang="ts">
  import { TokenAmount } from "@dfinity/utils";
  import IcrcTokenTransactionModal from "./IcrcTokenTransactionModal.svelte";
  import type { IcrcTokenModalProps } from "$lib/types/icrc-accounts.modal";

  let modal: IcrcTokenModalProps | undefined = undefined;

  const onNnsCkBTCAccountsModal = ({
    detail,
  }: CustomEvent<IcrcTokenModalProps>) => (modal = detail);
</script>

<svelte:window on:nnsCkBTCAccountsModal={onNnsCkBTCAccountsModal} />

{#if modal?.type === "icrc-send"}
  <IcrcTokenTransactionModal
    ledgerCanisterId={modal.data.universeId}
    token={modal.data.token}
    transactionFee={TokenAmount.fromE8s({
      amount: modal.data.token.fee,
      token: modal.data.token,
    })}
  />
{/if}
