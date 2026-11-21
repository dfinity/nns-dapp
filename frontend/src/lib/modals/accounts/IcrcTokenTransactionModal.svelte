<script lang="ts">
  import {
    queryIcrcMintingAccount,
    queryIcrcToken,
  } from "$lib/api/icrc-ledger.api";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { getCurrentIdentity } from "$lib/services/auth.services";
  import { transferTokens } from "$lib/services/icrc-accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { NewTransaction, TransactionInit } from "$lib/types/transaction";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { numberToUlps } from "$lib/utils/token.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { Principal } from "@icp-sdk/core/principal";
  import {
    TokenAmountV2,
    isNullish,
    nonNullish,
    type Token,
  } from "@dfinity/utils";
  import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
  import { createEventDispatcher, onMount } from "svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let ledgerCanisterId: Principal;
  export let universeId: Principal;
  export let token: Token;
  export let transactionFee: TokenAmountV2;
  export let reloadSourceAccount: (() => void) | undefined = undefined;

  let transactionInit: TransactionInit = {
    sourceAccount: selectedAccount,
  };

  let currentStep: WizardStep | undefined;
  let burnAddress: string | undefined = undefined;
  let mintingAccountQueryAttempted = false;
  // The token passed in as a property can come from an uncertified query. The
  // amount the user signs must never depend on unproven data, so we load the
  // certified metadata and use it for the whole transaction.
  let certifiedToken: IcrcTokenMetadata | undefined = undefined;

  const loadBurnAddress = async () => {
    try {
      const mintingAccount = await queryIcrcMintingAccount({
        identity: getCurrentIdentity(),
        canisterId: ledgerCanisterId,
        certified: true,
      });
      if (nonNullish(mintingAccount)) {
        burnAddress = encodeIcrcAccount(mintingAccount);
      }
    } catch {
      // Fall back to treating all addresses as regular (non-burn) transfers.
    } finally {
      mintingAccountQueryAttempted = true;
    }
  };

  const loadCertifiedToken = async () => {
    try {
      certifiedToken = await queryIcrcToken({
        identity: getCurrentIdentity(),
        canisterId: ledgerCanisterId,
        certified: true,
      });
    } catch (err) {
      // Without certified metadata the user cannot continue.
      toastsError({ labelKey: "error.token_not_found", err });
    }
  };

  onMount(() => Promise.all([loadBurnAddress(), loadCertifiedToken()]));

  // Show the property values until the certified metadata arrives. The user
  // cannot continue before that, so no amount is ever built from them.
  let displayedToken: Token;
  $: displayedToken = certifiedToken ?? token;

  let displayedFee: TokenAmountV2;
  $: displayedFee = nonNullish(certifiedToken)
    ? TokenAmountV2.fromUlps({
        amount: certifiedToken.fee,
        token: certifiedToken,
      })
    : transactionFee;

  $: title =
    currentStep?.name === "Form"
      ? replacePlaceholders($i18n.core.send_with_token, {
          $token: displayedToken.symbol,
        })
      : currentStep?.name === "QRCode"
        ? $i18n.accounts.scan_qr_code
        : $i18n.accounts.review_transaction;

  const dispatcher = createEventDispatcher();
  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    // For type safety. The user cannot reach this step without certified
    // metadata.
    if (isNullish(certifiedToken)) {
      return;
    }

    startBusy({
      initiator: "accounts",
    });

    const isBurn =
      nonNullish(burnAddress) && destinationAddress === burnAddress;

    const { blockIndex } = await transferTokens({
      source: sourceAccount,
      destinationAddress,
      amountUlps: numberToUlps({ amount, token: certifiedToken }),
      ledgerCanisterId,
      fee: isBurn ? 0n : certifiedToken.fee,
    });

    stopBusy("accounts");

    if (nonNullish(blockIndex)) {
      reloadSourceAccount?.();
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsClose");
    }
  };
</script>

<TransactionModal
  testId="icrc-token-transaction-modal-component"
  rootCanisterId={universeId}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  token={displayedToken}
  transactionFee={displayedFee}
  {transactionInit}
  {burnAddress}
  disableContinue={!mintingAccountQueryAttempted || isNullish(certifiedToken)}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value no-margin">
    {replacePlaceholders($i18n.accounts.sns_transaction_description, {
      $token: displayedToken.symbol,
    })}
  </p>
</TransactionModal>
