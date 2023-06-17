<script lang="ts">
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import type { WizardStep } from "@dfinity/gix-components";
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";

  export let currentStep: WizardStep | undefined;

  let modal: TransactionModal;

  $: modal, (() => modal?.goProgress())();

  const rootCanisterId = OWN_CANISTER_ID;
  const transactionFee = TokenAmount.fromE8s({
    amount: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
    token: ICPToken,
  });
</script>

<TransactionModal
  bind:currentStep
  bind:this={modal}
  {rootCanisterId}
  {transactionFee}
/>
