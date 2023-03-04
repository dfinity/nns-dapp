<script lang="ts">
  import TransactionModal from "$lib/modals/accounts/NewTransaction/TransactionModal.svelte";
  import type { WizardStep } from "@dfinity/gix-components";

  export let currentStep: WizardStep;

  let modal: TransactionModal;

  $: modal, (() => modal?.goProgress())();
</script>

<TransactionModal bind:currentStep bind:this={modal} />
