<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher, getContext, onDestroy } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsParams } from "@dfinity/sns";
  import {
    currentUserMaxCommitment,
    hasUserParticipatedToSwap,
    validParticipation,
  } from "$lib/utils/projects.utils";
  import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
  import TransactionModal from "$lib/modals/accounts/NewTransaction/TransactionModal.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { getSwapAccount } from "$lib/services/sns.services";
  import type {
    NewTransaction,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import AdditionalInfoForm from "./AdditionalInfoForm.svelte";
  import AdditionalInfoReview from "./AdditionalInfoReview.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import type { WizardStep } from "@dfinity/gix-components";
  import { replacePlaceholders, translate } from "$lib/utils/i18n.utils";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";
  import { initiateSnsSaleParticipation } from "$lib/services/sns-sale.services";
  import { snsTicketsStore } from "../../../stores/sns-tickets.store";

  const { store: projectDetailStore, reload } =
    getContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY);

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined | null;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;
  $: swapCommitment = $projectDetailStore.swapCommitment;
  let userHasParticipatedToSwap = false;
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

  let currentStep: WizardStep;
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

  let busy = true;
  $: busy = isNullish($projectDetailStore.summary)
    ? true
    : $projectDetailStore.summary.rootCanisterId === undefined ||
      $snsTicketsStore[$projectDetailStore.summary.rootCanisterId.toText()]
        ?.ticket !== null;

  const dispatcher = createEventDispatcher();
  const participate = async ({
    detail: { sourceAccount, amount },
  }: CustomEvent<NewTransaction>) => {
    if (nonNullish($projectDetailStore.summary)) {
      await initiateSnsSaleParticipation({
        account: sourceAccount,
        amount: TokenAmount.fromNumber({ amount, token: ICPToken }),
        rootCanisterId: $projectDetailStore.summary.rootCanisterId,
        postprocess: async () => {
          await reload();
          dispatcher("nnsClose");
        },
      });
    }
  };

  // Used for form inline validation
  let validateAmount: ValidateAmountFn;
  $: validateAmount = (amount: number | undefined) => {
    if (
      swapCommitment !== undefined &&
      swapCommitment !== null &&
      amount !== undefined
    ) {
      try {
        const tokenAmount = TokenAmount.fromNumber({ amount, token: ICPToken });
        const { valid, labelKey, substitutions } = validParticipation({
          project: {
            rootCanisterId: summary.rootCanisterId,
            summary,
            swapCommitment,
          },
          amount: tokenAmount,
        });
        // `validParticipation` does not return `valid` as `false` without a labelKey.
        // But we need to check because of type safety.
        return valid || labelKey === undefined
          ? undefined
          : replacePlaceholders(translate({ labelKey }), substitutions ?? {});
      } catch (error) {
        return $i18n.error.amount_not_valid;
      }
    }
    // We allow the user to try to participate even though the swap commitment is not yet available.
    return undefined;
  };

  onDestroy(() => {
    const rootCanisterId = $projectDetailStore.summary?.rootCanisterId;
    if (rootCanisterId === undefined) {
      return;
    }
  });
</script>

<!-- Edge case. If it's not defined, button to open this modal is not shown -->
{#if destinationAddress !== undefined}
  <TransactionModal
    rootCanisterId={OWN_CANISTER_ID}
    bind:currentStep
    on:nnsClose
    on:nnsSubmit={participate}
    {validateAmount}
    {destinationAddress}
    disableSubmit={!accepted || busy}
    skipHardwareWallets
    transactionFee={$mainTransactionFeeStoreAsToken}
    maxAmount={currentUserMaxCommitment({ summary, swapCommitment })}
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
    <p
      slot="destination-info"
      data-tid="sns-swap-participate-project-name"
      class="value"
    >
      {$projectDetailStore.summary?.metadata.name}
    </p>
    <p slot="description" class="value">
      {$i18n.sns_project_detail.participate_swap_description}
    </p>
  </TransactionModal>
{/if}
