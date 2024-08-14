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
  import ImportTokenReview from "$lib/components/accounts/ImportTokenReview.svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { addImportedToken } from "$lib/services/imported-tokens.services";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
  import { getIcrcTokenMetaData } from "$lib/services/icrc-accounts.services";
  import {
    isImportantCkToken,
    isUniqueImportedToken,
  } from "$lib/utils/imported-tokens.utils";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { isSnsLedgerCanisterId } from "$lib/utils/sns.utils";

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
  const next = () => {
    modal?.next();
  };
  const back = () => {
    modal?.back();
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
        labelKey: "import_token.ledger_canister_loading_error",
        err,
      });
    }
  };

  const onUserInput = async () => {
    if (isNullish(ledgerCanisterId)) return;

    // Ledger canister ID validation
    if (
      !isUniqueImportedToken({
        ledgerCanisterId,
        importedTokens: $importedTokensStore?.importedTokens,
      })
    ) {
      return toastsError({
        labelKey: "error__imported_tokens.is_duplication",
      });
    }
    if (
      isSnsLedgerCanisterId({
        ledgerCanisterId,
        snsProjects: $snsProjectsCommittedStore,
      })
    ) {
      return toastsError({
        labelKey: "error__imported_tokens.is_sns",
      });
    }
    if (
      isImportantCkToken({
        ledgerCanisterId,
      })
    ) {
      return toastsError({
        labelKey: "error__imported_tokens.is_important",
      });
    }

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
    console.log(
      "validOrEmptyIndexCanister",
      validOrEmptyIndexCanister,
      tokenMetaData
    );

    stopBusy("import-token-validation");

    if (validOrEmptyIndexCanister) {
      next();
    }
  };

  const onUserConfirm = async () => {
    if (
      isNullish(ledgerCanisterId) ||
      isNullish($importedTokensStore.importedTokens)
    ) {
      return;
    }

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

    stopBusy("import-token-importing");
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
      on:nnsSubmit={onUserInput}
    />
  {/if}
  {#if currentStep?.name === STEP_REVIEW && nonNullish(ledgerCanisterId) && nonNullish(tokenMetaData)}
    <ImportTokenReview
      {ledgerCanisterId}
      {indexCanisterId}
      {tokenMetaData}
      on:nnsBack={back}
      on:nnsConfirm={onUserConfirm}
    />
  {/if}
</WizardModal>
