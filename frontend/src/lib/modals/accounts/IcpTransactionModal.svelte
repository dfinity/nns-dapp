<script lang="ts">
  import { i18n } from "../../stores/i18n";

  import type { Step } from "../../stores/steps.state";

  import TransactionModal from "./NewTransaction/TransactionModal.svelte";

  let currentStep: Step;

  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.new_transaction
      : $i18n.accounts.review_transaction;

  const transfer = () => {
    console.log("transferring");
  };
</script>

<TransactionModal on:nnsSubmit={transfer} on:nnsClose bind:currentStep>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
</TransactionModal>
