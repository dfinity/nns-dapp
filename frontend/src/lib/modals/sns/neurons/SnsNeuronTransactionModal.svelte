<script lang="ts">
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type {
    TransactionInit,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { Token, TokenAmountV2 } from "@dfinity/utils";

  export let testId: string | undefined = undefined;
  export let token: Token;
  export let rootCanisterId: Principal;
  export let governanceCanisterId: Principal;
  export let transactionFee: TokenAmountV2;
  export let currentStep: WizardStep | undefined;
  export let validateAmount: ValidateAmountFn = () => undefined;

  let transactionInit: TransactionInit = {
    destinationAddress: governanceCanisterId.toText(),
  };
</script>

<TransactionModal
  {testId}
  {rootCanisterId}
  on:nnsSubmit
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  {validateAmount}
  {transactionInit}
>
  <slot name="title" slot="title" />
  <svelte:fragment slot="destination-info">
    {$i18n.sns_neurons.sns_neuron_destination}
  </svelte:fragment>
  <slot name="description" slot="description" />
</TransactionModal>
