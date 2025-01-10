<script lang="ts">
  import { goto } from "$app/navigation";
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import ImportTokenReview from "$lib/components/accounts/ImportTokenReview.svelte";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { getIcrcTokenMetaData } from "$lib/services/icrc-accounts.services";
  import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
  import { addImportedToken } from "$lib/services/imported-tokens.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { isImportantCkToken } from "$lib/utils/icrc-tokens.utils";
  import { isImportedToken } from "$lib/utils/imported-tokens.utils";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import { isSnsLedgerCanisterId } from "$lib/utils/sns.utils";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";
  import { get } from "svelte/store";

  let currentStep: WizardStep | undefined = undefined;

  const dispatch = createEventDispatcher();

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
  const next = () => modal?.next();
  const back = () => modal?.back();

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
  ): { errorLabelKey: string | undefined } => {
    if (ledgerCanisterId.toText() === LEDGER_CANISTER_ID.toText()) {
      return { errorLabelKey: "error__imported_tokens.is_icp" };
    }
    if (
      isImportedToken({
        ledgerCanisterId,
        importedTokens: $importedTokensStore?.importedTokens,
      })
    ) {
      return { errorLabelKey: "error__imported_tokens.is_duplication" };
    }
    if (
      isSnsLedgerCanisterId({
        ledgerCanisterId,
        snsProjects: $snsProjectsCommittedStore,
      })
    ) {
      return { errorLabelKey: "error__imported_tokens.is_sns" };
    }
    if (
      isImportantCkToken({
        ledgerCanisterId,
      })
    ) {
      return { errorLabelKey: "error__imported_tokens.is_important" };
    }

    return { errorLabelKey: undefined };
  };

  const onSubmit = async () => {
    if (isNullish(ledgerCanisterId)) return;

    // For testing purposes only.
    if (get(DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING)) {
      tokenMetaData = {
        symbol: "",
        name: "",
        decimals: 0,
        fee: 0n,
      };
      next();
      return;
    }

    const { errorLabelKey } = validateLedgerCanister(ledgerCanisterId);
    if (nonNullish(errorLabelKey)) {
      toastsError({
        labelKey: errorLabelKey,
      });
      return;
    }

    try {
      startBusy({
        initiator: "import-token-validation",
        labelKey: "import_token.verifying",
      });

      tokenMetaData = await getTokenMetaData(ledgerCanisterId);
      if (
        isNullish(tokenMetaData) ||
        (nonNullish(indexCanisterId) &&
          !(await matchLedgerIndexPair({ ledgerCanisterId, indexCanisterId })))
      ) {
        return;
      }
    } finally {
      stopBusy("import-token-validation");
    }

    next();
  };

  const onConfirm = async () => {
    // Just for type safety. This should never happen.
    if (
      isNullish(ledgerCanisterId) ||
      isNullish($importedTokensStore.importedTokens)
    ) {
      return;
    }

    try {
      startBusy({
        initiator: "import-token-importing",
        labelKey: "import_token.importing",
      });

      const { success } = await addImportedToken({
        tokenToAdd: {
          ledgerCanisterId,
          indexCanisterId,
        },
        importedTokens: $importedTokensStore.importedTokens,
      });
      if (success) {
        dispatch("nnsClose");
        goto(
          buildWalletUrl({
            universe: ledgerCanisterId.toText(),
          })
        );
      }
    } finally {
      stopBusy("import-token-importing");
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
    <ImportTokenReview
      {ledgerCanisterId}
      {indexCanisterId}
      {tokenMetaData}
      on:nnsBack={back}
      on:nnsConfirm={onConfirm}
    />
  {/if}
</WizardModal>
