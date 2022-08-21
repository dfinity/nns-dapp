<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import ParticipateScreen from "../../components/project-detail/ParticipateScreen.svelte";
  import ReviewParticipate from "../../components/project-detail/ReviewParticipate.svelte";
  import type { Account } from "../../types/account";
  import { ICP } from "@dfinity/nns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import type { SnsSwapInit } from "@dfinity/sns";
  import {
    currentUserMaxCommitment,
    hasUserParticipatedToSwap,
  } from "../../utils/projects.utils";
  import type { SnsSummary, SnsSwapCommitment } from "../../types/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;
  $: swapCommitment = $projectDetailStore.swapCommitment as
    | SnsSwapCommitment
    | undefined;
  let userHasParticipatedToSwap: boolean = false;
  $: userHasParticipatedToSwap = hasUserParticipatedToSwap({
    swapCommitment,
  });

  let init: SnsSwapInit;
  $: ({
    swap: { init },
  } = summary);

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

  let title: string | undefined;
  $: title =
    currentStep?.name === "Participate" && userHasParticipatedToSwap
      ? $i18n.sns_project_detail.increase_participation
      : currentStep?.title;

  let currentStep: Step;
  let modal: WizardModal;

  let selectedAccount: Account | undefined;
  let amount: number | undefined;

  let maxCommitment: ICP;
  $: maxCommitment = ICP.fromE8s(
    currentUserMaxCommitment({
      summary,
      swapCommitment,
    })
  );

  let minCommitment: ICP;
  $: minCommitment = ICP.fromE8s(
    userHasParticipatedToSwap ? BigInt(0) : init.min_participant_icp_e8s
  );

  const goNext = () => {
    modal.next();
  };
  const goBack = () => {
    modal.back();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{title ?? $i18n.sns_project_detail.participate}</svelte:fragment
  >
  {#if currentStep.name === "Participate"}
    <ParticipateScreen
      bind:selectedAccount
      bind:amount
      on:nnsNext={goNext}
      on:nnsClose
      {userHasParticipatedToSwap}
      minAmount={minCommitment}
      maxAmount={maxCommitment}
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
