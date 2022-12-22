<script lang="ts">
  import TransactionModal from "$lib/modals/accounts/NewTransaction/TransactionModal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { Token, TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";

  export let token: Token;
  export let rootCanisterId: Principal;
  export let governanceCanisterId: Principal;
  export let transactionFee: TokenAmount;
  export let currentStep: WizardStep;
</script>

<TransactionModal
  {rootCanisterId}
  on:nnsSubmit
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  destinationAddress={governanceCanisterId.toText()}
>
  <slot name="title" slot="title" />
  <svelte:fragment slot="destination-info">
    {$i18n.sns_neurons.sns_neuron_destination}
  </svelte:fragment>
  <slot name="description" slot="description" />
</TransactionModal>
