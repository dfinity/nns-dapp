<script lang="ts">
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { TokenAmount, Token } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import type { ValidateAmountFn } from "$lib/types/transaction";
  import type { TransactionInit } from "$lib/types/transaction";

  export let testId: string | undefined = undefined;
  export let token: Token;
  export let rootCanisterId: Principal;
  export let governanceCanisterId: Principal;
  export let transactionFee: TokenAmount;
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
