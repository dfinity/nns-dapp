<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import Participate from "../../components/project-detail/Participate.svelte";
  import ReviewParticipate from "../../components/project-detail/ReviewParticipate.svelte";
  import type { SnsFullProject } from "../../stores/projects.store";
  import type { Account } from "../../types/account";
  import { ICP } from "@dfinity/nns";

  export let project: SnsFullProject;

  const steps: Steps = [
    {
      name: "Participate",
      showBackButton: false,
      title: $i18n.sns_project_detail.participate,
    },
    {
      name: "ReviewTransaction",
      showBackButton: false,
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: Step;
  let modal: WizardModal;

  let selectedAccount: Account | undefined;
  let amount: number | undefined;

  const goNext = () => {
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>
  {#if currentStep.name === "Participate"}
    <Participate
      bind:selectedAccount
      bind:amount
      on:nnsNext={goNext}
      on:nnsClose
      minAmount={ICP.fromE8s(project.summary.minParticipationCommitment)}
      maxAmount={ICP.fromE8s(project.summary.maxParticipationCommitment)}
    />
  {/if}
  {#if currentStep.name === "ReviewTransaction"}
    <ReviewParticipate />
  {/if}
</WizardModal>
