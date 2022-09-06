<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { Step } from "../../../stores/steps.state";
  import { ICP } from "@dfinity/nns";
  import { createEventDispatcher, getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../../types/project-detail.context";
  import type { SnsSwapInit } from "@dfinity/sns";
  import {
    currentUserMaxCommitment,
    hasUserParticipatedToSwap,
    projectRemainingAmount,
  } from "../../../utils/projects.utils";
  import type { SnsSummary, SnsSwapCommitment } from "../../../types/sns";
  import TransactionModal from "../../accounts/NewTransaction/TransactionModal.svelte";
  import { nonNullish } from "../../../utils/utils";
  import { startBusy, stopBusy } from "../../../stores/busy.store";
  import {
    getSwapAccount,
    participateInSwap,
  } from "../../../services/sns.services";
  import { toastsStore } from "../../../stores/toasts.store";
  import type { NewTransaction } from "../../../types/transaction.context";
  import { convertNumberToICP } from "../../../utils/icp.utils";
  import AdditionalInfoForm from "./AdditionalInfoForm.svelte";
  import AdditionalInfoReview from "./AdditionalInfoReview.svelte";

  const { store: projectDetailStore, reload } =
    getContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY);

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined | null;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;
  $: swapCommitment = $projectDetailStore.swapCommitment;
  let userHasParticipatedToSwap: boolean = false;
  $: userHasParticipatedToSwap = hasUserParticipatedToSwap({
    swapCommitment,
  });

  let destinationAddress: string | undefined;
  $: (async () => {
    destinationAddress =
      $projectDetailStore.summary?.swapCanisterId !== undefined
        ? (
            await getSwapAccount($projectDetailStore.summary?.swapCanisterId)
          ).toHex()
        : undefined;
  })();

  let init: SnsSwapInit;
  $: ({
    swap: { init },
  } = summary);

  let currentStep: Step;
  let title: string | undefined;
  $: title =
    currentStep?.name === "Form"
      ? userHasParticipatedToSwap
        ? $i18n.sns_project_detail.increase_participation
        : $i18n.sns_project_detail.participate
      : $i18n.accounts.review_transaction;

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

  let accepted: boolean;

  const dispatcher = createEventDispatcher();
  const participate = async ({
    detail: { sourceAccount, amount },
  }: CustomEvent<NewTransaction>) => {
    if (nonNullish($projectDetailStore.summary)) {
      startBusy({
        initiator: "project-participate",
      });
      const { success } = await participateInSwap({
        account: sourceAccount,
        amount: convertNumberToICP(amount),
        rootCanisterId: $projectDetailStore.summary.rootCanisterId,
      });
      if (success) {
        await reload();

        toastsStore.success({
          labelKey: "sns_project_detail.participate_success",
        });
        dispatcher("nnsClose");
      }
      stopBusy("project-participate");
    }
  };
</script>

<!-- Edge case. If it's not defined, button to open this modal is not shown -->
{#if destinationAddress !== undefined}
  <TransactionModal
    bind:currentStep
    on:nnsClose
    on:nnsSubmit={participate}
    {destinationAddress}
    disableSubmit={!accepted}
    maxAmount={projectRemainingAmount(summary)}
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.sns_project_detail.participate}</svelte:fragment
    >
    <AdditionalInfoForm
      slot="additional-info-form"
      {minCommitment}
      {maxCommitment}
      userHasParticipated={userHasParticipatedToSwap}
    />
    <AdditionalInfoReview slot="additional-info-review" bind:accepted />
    <p slot="destination-info" data-tid="sns-swap-participate-project-name">
      {$projectDetailStore.summary?.metadata.name}
    </p>
    <p slot="description">
      {$i18n.sns_project_detail.participate_swap_description}
    </p>
  </TransactionModal>
{/if}

<style lang="scss">
  p {
    margin: 0;
  }
</style>
