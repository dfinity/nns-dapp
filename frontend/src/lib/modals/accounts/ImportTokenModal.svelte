<script lang="ts">
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { getIcrcTokenMetaData } from "$lib/services/icrc-accounts.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { isSnsLedgerCanisterId } from "$lib/utils/sns.utils";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { isImportantCkToken } from "$lib/utils/icrc-tokens.utils";

  let currentStep: WizardStep | undefined = undefined;
  const STEP_FORM = "Form";
  const STEP_REVIEW = "Review";
  const steps: WizardSteps = [
    {
      name: STEP_FORM,
      title: $i18n.import_token.import_token,
    },
    {
      name: STEP_REVIEW,
      title: $i18n.import_token.review_token_info,
    },
  ];
  let modal: WizardModal;
  const next = () => {
    modal?.next();
  };
  let ledgerCanisterId: Principal | undefined;
  let indexCanisterId: Principal | undefined;
  let tokenMetaData: IcrcTokenMetadata | undefined;

  const getTokenMetaData = async (
    ledgerCanisterId: Principal
  ): Promise<IcrcTokenMetadata | undefined> => {
    try {
      return await getIcrcTokenMetaData({ ledgerCanisterId });
    } catch (err) {
      toastsError({
        labelKey: "error__imported_tokens.ledger_canister_loading",
        err,
      });
    }
  };
  const validateLedgerCanister = (
    ledgerCanisterId: Principal
  ): { valid: boolean } => {
    let errorLabelKey: string | undefined = undefined;
    // Ledger canister ID validation
    if (
      isImportedToken({
        ledgerCanisterId,
        importedTokens: $importedTokensStore?.importedTokens,
      })
    ) {
      errorLabelKey = "error__imported_tokens.is_duplication";
    }
    if (
      isSnsLedgerCanisterId({
        ledgerCanisterId,
        snsProjects: $snsProjectsCommittedStore,
      })
    ) {
      errorLabelKey = "error__imported_tokens.is_sns";
    }
    if (
      isImportantCkToken({
        ledgerCanisterId,
      })
    ) {
      errorLabelKey = "error__imported_tokens.is_important";
    }

    if (nonNullish(errorLabelKey)) {
      toastsError({
        labelKey: errorLabelKey,
      });
      return { valid: false };
    }
    return { valid: true };
  };

  const onSubmit = async () => {
    if (isNullish(ledgerCanisterId)) return;

    const { valid: isValidLedgerCanisterId } =
      validateLedgerCanister(ledgerCanisterId);

    if (!isValidLedgerCanisterId) return;

    startBusy({
      initiator: "import-token-validation",
      labelKey: "import_token.verifying",
    });

    tokenMetaData = await getTokenMetaData(ledgerCanisterId);
    // No need to validate index canister if tokenMetaData fails to load or no index canister is provided
    const validOrEmptyIndexCanister =
      nonNullish(tokenMetaData) &&
      (nonNullish(indexCanisterId)
        ? await matchLedgerIndexPair({ ledgerCanisterId, indexCanisterId })
        : true);

    stopBusy("import-token-validation");

    if (validOrEmptyIndexCanister) {
      next();
    }
  };
</script>

<WizardModal
  testId="import-token-modal-component"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep?.name === STEP_FORM}
    <ImportTokenForm
      bind:ledgerCanisterId
      bind:indexCanisterId
      on:nnsClose
      on:nnsSubmit={onSubmit}
    />
  {/if}
  {#if currentStep?.name === STEP_REVIEW && nonNullish(ledgerCanisterId) && nonNullish(tokenMetaData)}
    TBD: Review imported token
  {/if}
</WizardModal>
