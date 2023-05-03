<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction, TransactionInit } from "$lib/types/transaction";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import type { ValidateAmountFn } from "$lib/types/transaction";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { Account } from "$lib/types/account";
  import type { WizardStep } from "@dfinity/gix-components";
  import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";
  import type { TokenAmount } from "@dfinity/nns";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { convertCkBTCToBtc } from "$lib/services/ckbtc-convert.services";
  import BitcoinEstimatedFee from "$lib/components/accounts/BitcoinEstimatedFee.svelte";
  import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";
  import ConvertBtcInProgress from "$lib/components/accounts/ConvertBtcInProgress.svelte";
  import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
  import { assertCkBTCUserInputAmount } from "$lib/utils/ckbtc.utils";
  import BitcoinEstimatedAmountReceived from "$lib/components/accounts/BitcoinEstimatedAmountReceived.svelte";
  import TransactionReceivedAmount from "$lib/components/transaction/TransactionReceivedAmount.svelte";
  import { nonNullish } from "@dfinity/utils";
  import BitcoinKYTFee from "$lib/components/accounts/BitcoinKYTFee.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let loadTransactions = false;

  export let canisters: CkBTCAdditionalCanisters;
  export let universeId: UniverseCanisterId;
  export let token: IcrcTokenMetadata;
  export let transactionFee: TokenAmount;

  let transactionInit: TransactionInit = {
    sourceAccount: selectedAccount,
    mustSelectNetwork: isUniverseCkTESTBTC(universeId),
  };

  let selectedNetwork: TransactionNetwork | undefined = undefined;
  let bitcoinEstimatedFee: bigint | undefined | null = undefined;
  let kytEstimatedFee: bigint | undefined | null = undefined;

  let currentStep: WizardStep | undefined;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.send
      : currentStep?.name === "Progress"
      ? $i18n.ckbtc.sending_ckbtc_to_btc
      : currentStep?.name === "QRCode"
      ? $i18n.accounts.scan_qr_code
      : $i18n.accounts.you_are_sending;

  let modal: TransactionModal;
  let progressStep: ConvertBtcStep = ConvertBtcStep.INITIALIZATION;

  const dispatcher = createEventDispatcher();

  const transferTokens = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "accounts",
    });

    const { blockIndex } = await ckBTCTransferTokens({
      source: sourceAccount,
      destinationAddress,
      amount,
      loadTransactions,
      universeId,
      indexCanisterId: canisters.indexCanisterId,
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
    modal?.goProgress();

    const updateProgress = (step: ConvertBtcStep) => (progressStep = step);

    const { success } = await convertCkBTCToBtc({
      source: sourceAccount,
      destinationAddress,
      amount,
      universeId,
      canisters,
      updateProgress,
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

  let validateAmount: ValidateAmountFn;
  $: validateAmount = ({ amount, selectedAccount }) => {
    assertCkBTCUserInputAmount({
      networkBtc,
      sourceAccount: selectedAccount,
      amount,
      transactionFee: transactionFee.toE8s(),
      bitcoinEstimatedFee,
      kytEstimatedFee,
    });

    return undefined;
  };
</script>

<TransactionModal
  rootCanisterId={universeId}
  bind:this={modal}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  {transactionInit}
  bind:selectedNetwork
  {validateAmount}
  bind:amount={userAmount}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value no-margin">
    {#if networkBtc}
      {$i18n.accounts.ckbtc_to_btc_transaction_description}
    {:else}
      {replacePlaceholders($i18n.accounts.ckbtc_transaction_description, {
        $token: token.symbol,
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
    <BitcoinKYTFee
      {selectedNetwork}
      minterCanisterId={canisters.minterCanisterId}
      bind:kytFee={kytEstimatedFee}
    />
  </svelte:fragment>
  <svelte:fragment slot="received-amount">
    {#if networkBtc}
      <BitcoinEstimatedAmountReceived
        {bitcoinEstimatedFee}
        {kytEstimatedFee}
        {universeId}
        amount={userAmount}
      />
    {:else if nonNullish(userAmount)}
      <TransactionReceivedAmount amount={userAmount} {token} />
    {/if}
  </svelte:fragment>
  <ConvertBtcInProgress slot="in_progress" {progressStep} />
</TransactionModal>
