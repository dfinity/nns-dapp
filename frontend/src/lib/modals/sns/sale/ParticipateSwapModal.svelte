<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import {
    createEventDispatcher,
    getContext,
    onDestroy,
    onMount,
  } from "svelte";
  import { getConditionsToAccept } from "$lib/getters/sns-summary";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import {
    currentUserMaxCommitment,
    hasUserParticipatedToSwap,
    validParticipation,
  } from "$lib/utils/projects.utils";
  import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { getSwapAccount } from "$lib/services/sns.services";
  import type {
    NewTransaction,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import AdditionalInfoForm from "$lib/components/sale/AdditionalInfoForm.svelte";
  import AdditionalInfoReview from "$lib/components/sale/AdditionalInfoReview.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import type { WizardStep } from "@dfinity/gix-components";
  import { replacePlaceholders, translate } from "$lib/utils/i18n.utils";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";
  import { initiateSnsSaleParticipation } from "$lib/services/sns-sale.services";
  import {
    getCommitmentE8s,
    hasOpenTicketInProcess,
  } from "$lib/utils/sns.utils";
  import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
  import SaleInProgress from "$lib/components/sale/SaleInProgress.svelte";
  import { SaleStep } from "$lib/types/sale";
  import {
    cancelPollAccounts,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import type { TransactionInit } from "$lib/types/transaction";

  onMount(() => {
    pollAccounts(false);
  });

  onDestroy(() => {
    cancelPollAccounts();
  });

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

  let areSwapConditionsAccepted = false;
  let conditionsToAccept: string | undefined;
  $: conditionsToAccept = getConditionsToAccept(summary);

  let disableContinue = true;
  $: disableContinue =
    nonNullish(conditionsToAccept) && !areSwapConditionsAccepted;

  let destinationAddress: string | undefined;
  $: (async () => {
    destinationAddress =
      $projectDetailStore.summary?.swapCanisterId !== undefined
        ? (
            await getSwapAccount($projectDetailStore.summary?.swapCanisterId)
          ).toHex()
        : undefined;
  })();

  let transactionInit: TransactionInit | undefined;
  $: transactionInit = nonNullish(destinationAddress)
    ? {
        destinationAddress,
      }
    : undefined;

  let currentStep: WizardStep | undefined;
  let title: string | undefined;
  $: title =
    currentStep?.name === "Form"
      ? userHasParticipatedToSwap
        ? $i18n.sns_project_detail.increase_participation
        : $i18n.sns_project_detail.participate
      : currentStep?.name === "Progress"
      ? $i18n.sns_sale.participation_in_progress
      : $i18n.accounts.review_transaction;

  let accepted: boolean;

  let busy = true;
  $: busy =
    hasOpenTicketInProcess({
      rootCanisterId: $projectDetailStore?.summary?.rootCanisterId,
      ticketsStore: $snsTicketsStore,
    }).status !== "none";

  let modal: TransactionModal;
  let progressStep: SaleStep = SaleStep.INITIALIZATION;

  const dispatcher = createEventDispatcher();
  const participate = async ({
    detail: { sourceAccount, amount },
  }: CustomEvent<NewTransaction>) => {
    if (nonNullish($projectDetailStore.summary)) {
      modal?.goProgress();

      const updateProgress = (step: SaleStep) => (progressStep = step);
      const userCommitment =
        getCommitmentE8s($projectDetailStore.swapCommitment) ?? BigInt(0);

      const { success } = await initiateSnsSaleParticipation({
        account: sourceAccount,
        amount: TokenAmount.fromNumber({ amount, token: ICPToken }),
        rootCanisterId: $projectDetailStore.summary.rootCanisterId,
        userCommitment,
        postprocess: async () => {
          await reload();
        },
        updateProgress,
      });

      // We close the modal anyway because either on success or error there will be a toast and user might have to replay everything from scratch anyway.
      if (!success) {
        dispatcher("nnsClose");
        return;
      }

      // We defer the closing of the modal a bit to let the user notice the last step was successful
      setTimeout(() => {
        dispatcher("nnsClose");
      }, 1000);
    }
  };

  // Used for form inline validation
  let validateAmount: ValidateAmountFn;
  $: validateAmount = ({ amount }) => {
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
</script>

<!-- Edge case. If it's not defined, button to open this modal is not shown -->
{#if nonNullish(transactionInit)}
  <TransactionModal
    testId="participate-swap-modal-component"
    rootCanisterId={OWN_CANISTER_ID}
    bind:currentStep
    bind:this={modal}
    on:nnsClose
    on:nnsSubmit={participate}
    {validateAmount}
    {transactionInit}
    {disableContinue}
    disableSubmit={!accepted || busy}
    skipHardwareWallets
    transactionFee={$mainTransactionFeeStoreAsToken}
    maxAmount={currentUserMaxCommitment({ summary, swapCommitment })}
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.sns_project_detail.participate}</svelte:fragment
    >
    <div class="additional-info" slot="additional-info-form">
      <AdditionalInfoForm
        {conditionsToAccept}
        bind:areConditionsAccepted={areSwapConditionsAccepted}
      />
    </div>
    <div class="additional-info" slot="additional-info-review">
      <AdditionalInfoReview bind:accepted />
    </div>
    <p
      slot="destination-info"
      data-tid="sns-swap-participate-project-name"
      class="value"
    >
      {$projectDetailStore.summary?.metadata.name}
    </p>
    <p slot="description" class="value no-margin">
      {$i18n.sns_project_detail.participate_swap_description}
    </p>
    <SaleInProgress slot="in_progress" {progressStep} />
  </TransactionModal>
{/if}

<style lang="scss">
  .additional-info {
    padding-top: var(--padding-2x);
  }
</style>
