<script lang="ts">
  import BitcoinEstimatedAmountReceived from "$lib/components/accounts/BitcoinEstimatedAmountReceived.svelte";
  import BitcoinEstimatedFee from "$lib/components/accounts/BitcoinEstimatedFee.svelte";
  import BitcoinKYTFee from "$lib/components/accounts/BitcoinKYTFee.svelte";
  import ConvertBtcInProgress from "$lib/components/accounts/ConvertBtcInProgress.svelte";
  import TransactionReceivedAmount from "$lib/components/transaction/TransactionReceivedAmount.svelte";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import {
    convertCkBTCToBtcIcrc2,
    type ConvertCkBTCToBtcParams,
  } from "$lib/services/ckbtc-convert.services";
  import { loadCkBTCInfo } from "$lib/services/ckbtc-info.services";
  import {
    getCertifiedIcrcTokenMetaData,
    transferTokens as transferIcrcTokens,
  } from "$lib/services/icrc-accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import {
    ckBTCInfoStore,
    type CkBTCInfoStoreUniverseData,
  } from "$lib/stores/ckbtc-info.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type {
    NewTransaction,
    TransactionInit,
    TransactionNetwork,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { assertCkBTCUserInputAmount } from "$lib/utils/ckbtc.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { numberToUlps } from "$lib/utils/token.utils";
  import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import {
    TokenAmountV2,
    isNullish,
    nonNullish,
    type Token,
  } from "@dfinity/utils";
  import { createEventDispatcher, onMount } from "svelte";

  export let selectedAccount: Account | undefined = undefined;

  export let canisters: CkBTCAdditionalCanisters;
  export let universeId: UniverseCanisterId;
  export let token: Token;
  export let transactionFee: TokenAmountV2;

  let transactionInit: TransactionInit = {
    sourceAccount: selectedAccount,
    mustSelectNetwork: true,
  };

  let selectedNetwork: TransactionNetwork | undefined = undefined;
  let bitcoinEstimatedFee: bigint | undefined | null = undefined;

  let currentStep: WizardStep | undefined;

  // The token property can come from a query call. The amount the user signs
  // must never depend on unproven data.
  let certifiedToken: IcrcTokenMetadata | undefined = undefined;

  onMount(async () => {
    certifiedToken = await getCertifiedIcrcTokenMetaData({
      ledgerCanisterId: universeId,
    });
  });

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

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? replacePlaceholders($i18n.core.send_with_token, {
          $token: networkBtc ? $i18n.ckbtc.btc : displayedToken.symbol,
        })
      : currentStep?.name === "Progress"
        ? $i18n.ckbtc.sending_ckbtc_to_btc
        : currentStep?.name === "QRCode"
          ? $i18n.accounts.scan_qr_code
          : $i18n.accounts.review_transaction;

  let modal: TransactionModal;
  let progressStep: ConvertBtcStep = ConvertBtcStep.APPROVE_TRANSFER;

  const dispatcher = createEventDispatcher();

  const transferTokens = async ({
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

    const { blockIndex } = await transferIcrcTokens({
      source: sourceAccount,
      destinationAddress,
      amountUlps: numberToUlps({ amount, token: certifiedToken }),
      ledgerCanisterId: universeId,
      fee: certifiedToken.fee,
    });

    stopBusy("accounts");

    if (nonNullish(blockIndex)) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsTransfer");
    }
  };

  const convert = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    // For type safety. The user cannot reach this step without certified
    // metadata.
    if (isNullish(certifiedToken)) {
      return;
    }

    modal?.goProgress();

    const updateProgress = (step: ConvertBtcStep) => (progressStep = step);

    const params: ConvertCkBTCToBtcParams = {
      destinationAddress,
      amountUlps: numberToUlps({ amount, token: certifiedToken }),
      universeId,
      canisters,
      updateProgress,
    };

    const { success } = await convertCkBTCToBtcIcrc2({
      source: sourceAccount,
      ...params,
    });

    if (success) {
      toastsSuccess({
        labelKey: "ckbtc.transaction_success_about_thirty_minutes",
      });
      dispatcher("nnsTransfer");
      return;
    }

    // Unlike "send ckBTC" we close the modal in case of error because the issue can potentially happen after a successful transfer
    dispatcher("nnsClose");
  };

  let networkBtc = false;
  $: networkBtc = isTransactionNetworkBtc(selectedNetwork);

  const transfer = async ($event: CustomEvent<NewTransaction>) => {
    if (networkBtc) {
      await convert($event);
      return;
    }

    await transferTokens($event);
  };

  let userAmount: number | undefined = undefined;

  let infoData: CkBTCInfoStoreUniverseData | undefined = undefined;
  $: infoData = $ckBTCInfoStore[universeId.toText()];

  let validateAmount: ValidateAmountFn;
  $: validateAmount = ({ amount, selectedAccount }) => {
    assertCkBTCUserInputAmount({
      networkBtc,
      sourceAccount: selectedAccount,
      amount,
      transactionFee: displayedFee.toUlps(),
      infoData,
    });

    return undefined;
  };

  $: loadCkBTCInfo({
    universeId: universeId,
    minterCanisterId: canisters.minterCanisterId,
  });
</script>

<TransactionModal
  testId="ckbtc-transaction-modal-component"
  rootCanisterId={universeId}
  bind:this={modal}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  token={displayedToken}
  transactionFee={displayedFee}
  {transactionInit}
  bind:selectedNetwork
  {validateAmount}
  bind:amount={userAmount}
  disableContinue={isNullish(certifiedToken)}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value no-margin">
    {#if networkBtc}
      {$i18n.accounts.ckbtc_to_btc_transaction_description}
    {:else}
      {replacePlaceholders($i18n.accounts.ckbtc_transaction_description, {
        $token: displayedToken.symbol,
      })}
    {/if}
  </p>
  <svelte:fragment slot="additional-info-form">
    <BitcoinEstimatedFee
      {selectedNetwork}
      amount={userAmount}
      minterCanisterId={canisters.minterCanisterId}
      bind:bitcoinEstimatedFee
    />
    {#if networkBtc}
      <BitcoinKYTFee {universeId} />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="received-amount">
    {#if networkBtc}
      <BitcoinEstimatedAmountReceived
        {bitcoinEstimatedFee}
        {universeId}
        amount={userAmount}
      />
    {:else if nonNullish(userAmount)}
      <TransactionReceivedAmount amount={userAmount} token={displayedToken} />
    {/if}
  </svelte:fragment>
  <ConvertBtcInProgress slot="in_progress" {progressStep} />
</TransactionModal>
