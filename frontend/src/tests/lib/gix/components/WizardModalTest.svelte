<script lang="ts">
  import WizardModal from "$lib/gix/components/WizardModal.svelte";
  import type { WizardStep, WizardSteps } from "$lib/gix/types/wizard";

  const steps: WizardSteps = [
    {
      name: "EnterController",
      title: "Enter a controller",
    },
    {
      name: "ConfirmController",
      title: "Confirm the controller",
    },
    {
      name: "HiddenStep",
      title: "This step is hidden",
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal<string>;
</script>

<WizardModal bind:this={modal} {steps} bind:currentStep>
  {#snippet title()}My title{/snippet}

  {#if currentStep?.name === "EnterController"}
    <p>Step to enter the controller</p>

    <div class="toolbar">
      <button class="primary" data-tid="next-button" onclick={modal.next}>
        Next
      </button>
      <button
        class="primary"
        data-tid="hidden-step-button"
        onclick={() => modal.set(2)}
      >
        Hidden Step
      </button>
    </div>
  {:else if currentStep?.name === "ConfirmController"}
    <p>Step to confirm the controller</p>

    <div class="toolbar">
      <button class="secondary" data-tid="back-button" onclick={modal.back}>
        Back
      </button>
    </div>
  {:else if currentStep?.name === "HiddenStep"}
    <p data-tid="hidden-step">
      This step is hidden and should not be displayed.
    </p>
  {/if}
</WizardModal>
