<script lang="ts">
  import SnsTransactionModal from "$lib/modals/sns/neurons/SnsTransactionModal.svelte";
  import type { Token, TokenAmount } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type { WizardStep } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let token: Token;
  export let rootCanisterId: Principal;
  export let governanceCanisterId: Principal;
  export let transactionFee: TokenAmount;

  let currentStep: WizardStep;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.neurons.top_up_neuron
      : $i18n.accounts.review_transaction;

  const increaseStake = async () => {};
</script>

<SnsTransactionModal
  {rootCanisterId}
  on:nnsSubmit={increaseStake}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  {governanceCanisterId}
>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
  <p slot="description" class="value">here description</p>
</SnsTransactionModal>
