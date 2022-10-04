<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Step } from "$lib/stores/steps.state";
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher, getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsParams } from "@dfinity/sns";
  import {
    currentUserMaxCommitment,
    hasUserParticipatedToSwap,
    projectRemainingAmount,
  } from "$lib/utils/projects.utils";
  import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
  import TransactionModal from "$lib/accounts/NewTransaction/TransactionModal.svelte";
  import { nonNullish } from "$lib/utils/utils";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import {
    getSwapAccount,
    participateInSwap,
  } from "$lib/services/sns.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction.context";
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

  let params: SnsParams;
  $: ({
    swap: { params },
  } = summary);

  let currentStep: Step;
  let title: string | undefined;
  $: title =
    currentStep?.name === "Form"
      ? userHasParticipatedToSwap
        ? $i18n.sns_project_detail.increase_participation
        : $i18n.sns_project_detail.participate
      : $i18n.accounts.review_transaction;

  let maxCommitment: TokenAmount;
  $: maxCommitment = TokenAmount.fromE8s({
    amount: currentUserMaxCommitment({
      summary,
      swapCommitment,
    }),
    token: ICPToken,
  });

  let minCommitment: TokenAmount;
  $: minCommitment = TokenAmount.fromE8s({
    amount: userHasParticipatedToSwap
      ? BigInt(0)
      : params.min_participant_icp_e8s,
    token: ICPToken,
  });

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
        amount: TokenAmount.fromNumber({ amount, token: ICPToken }),
        rootCanisterId: $projectDetailStore.summary.rootCanisterId,
      });
      if (success) {
        await reload();

        toastsSuccess({
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
    skipHardwareWallets
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
