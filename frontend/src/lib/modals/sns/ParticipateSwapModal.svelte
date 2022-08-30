<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { Step } from "../../stores/steps.state";
  import { ICP } from "@dfinity/nns";
  import { createEventDispatcher, getContext } from "svelte";
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
  import TransactionModal from "../accounts/NewTransaction/Modal.svelte";
  import Icp from "../../components/ic/ICP.svelte";
  import KeyValuePair from "../../components/ui/KeyValuePair.svelte";
  import IcpText from "../../components/ic/ICPText.svelte";
  import { mainTransactionFeeStoreAsIcp } from "../../stores/transaction-fees.store";
  import { nonNullish } from "../../utils/utils";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import {
    getSwapAccount,
    participateInSwap,
  } from "../../services/sns.services";
  import { toastsStore } from "../../stores/toasts.store";
  import type { NewTransaction } from "../../types/transaction.context";
  import IconWarning from "../../icons/IconWarning.svelte";
  import { ICON_SIZE_LARGE } from "../../constants/style.constants";
  import Checkbox from "../../components/ui/Checkbox.svelte";
  import { convertNumberToICP } from "../../utils/icp.utils";

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

  let title: string | undefined;
  $: title =
    currentStep?.name === "Form"
      ? userHasParticipatedToSwap
        ? $i18n.sns_project_detail.increase_participation
        : $i18n.sns_project_detail.participate
      : $i18n.accounts.review_transaction;

  let currentStep: Step;

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

  let accepted: boolean = false;
  const toggelAccept = () => (accepted = !accepted);

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
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.sns_project_detail.participate}</svelte:fragment
    >
    <svelte:fragment slot="additional-info-form">
      {#if userHasParticipatedToSwap}
        <p class="right">
          {$i18n.sns_project_detail.max_left}
          <Icp singleLine icp={maxCommitment} />
        </p>
      {:else}
        <KeyValuePair>
          <IcpText slot="key" icp={minCommitment}>
            {$i18n.core.min}
          </IcpText>
          <IcpText slot="value" icp={maxCommitment}>
            {$i18n.core.max}
          </IcpText>
        </KeyValuePair>
      {/if}
      <p class="right">
        <span>{$i18n.accounts.transaction_fee}</span>
        <Icp singleLine icp={$mainTransactionFeeStoreAsIcp} />
      </p>
    </svelte:fragment>
    <div slot="additional-info-review" class="additional-info-review">
      <div class="warning">
        <span class="icon"><IconWarning size={ICON_SIZE_LARGE} /></span>
        <span>{$i18n.sns_project_detail.participate_swap_warning}</span>
      </div>
      <Checkbox
        text="block"
        inputId="agree"
        checked={accepted}
        on:nnsChange={toggelAccept}
      >
        {$i18n.sns_project_detail.understand_agree}
      </Checkbox>
    </div>
    <p slot="destination-info" data-tid="sns-swap-participate-project-name">
      {$projectDetailStore.summary?.metadata.name}
    </p>
    <p slot="description">
      {$i18n.sns_project_detail.participate_swap_description}
    </p>
  </TransactionModal>
{/if}

<style lang="scss">
  .additional-info-review {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    .warning {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--padding-2x);

      .icon {
        color: var(--warning-emphasis);
      }
    }

    :global(label) {
      order: 1;
    }
  }

  p {
    margin: 0;
  }

  .right {
    text-align: right;
  }
</style>
