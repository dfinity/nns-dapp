<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import ParticipateScreen from "../../components/project-detail/ParticipateScreen.svelte";
  import ReviewParticipate from "../../components/project-detail/ReviewParticipate.svelte";
  import type { Account } from "../../types/account";
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary } from "../../types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;

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
  const goBack = () => {
    modal.back();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>
  {#if currentStep.name === "Participate"}
    <ParticipateScreen
      bind:selectedAccount
      bind:amount
      on:nnsNext={goNext}
      on:nnsClose
      minAmount={ICP.fromE8s(summary.minParticipationCommitment)}
      maxAmount={ICP.fromE8s(summary.maxParticipationCommitment)}
    />
  {/if}
  {#if currentStep.name === "ReviewTransaction" && selectedAccount !== undefined && amount !== undefined}
    <ReviewParticipate
      account={selectedAccount}
      {amount}
      on:nnsBack={goBack}
      on:nnsClose
    />
  {/if}
</WizardModal>
