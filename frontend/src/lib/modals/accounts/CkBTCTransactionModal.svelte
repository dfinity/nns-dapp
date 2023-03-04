<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import { TransactionNetwork } from "$lib/types/transaction";
  import type { ValidateAmountFn } from "$lib/types/transaction";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";
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
  import BitcoinEstimatedFeeDisplay from "$lib/components/accounts/BitcoinEstimatedFeeDisplay.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let loadTransactions = false;

  export let canisters: CkBTCAdditionalCanisters;
  export let universeId: UniverseCanisterId;
  export let token: IcrcTokenMetadata;
  export let transactionFee: TokenAmount;

  let selectedNetwork: TransactionNetwork | undefined = undefined;
  let bitcoinEstimatedFee: bigint | undefined | null = undefined;

  let currentStep: WizardStep;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.send
      : $i18n.accounts.you_are_sending;

  const dispatcher = createEventDispatcher();

  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "accounts",
    });

    const { success } = await (selectedNetwork === TransactionNetwork.BITCOIN
      ? convertCkBTCToBtc({
          source: sourceAccount,
          destinationAddress,
          amount,
          universeId,
          canisters,
        })
      : ckBTCTransferTokens({
          source: sourceAccount,
          destinationAddress,
          amount,
          loadTransactions,
          universeId,
          indexCanisterId: canisters.indexCanisterId,
        }));

    stopBusy("accounts");

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsTransfer");
    }
  };

  let userAmount: number | undefined = undefined;
  const validateAmount: ValidateAmountFn = (
    amount: number | undefined
  ): string | undefined => {
    userAmount = amount;
    return undefined;
  };
</script>

<TransactionModal
  rootCanisterId={universeId}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  sourceAccount={selectedAccount}
  mustSelectNetwork={isUniverseCkTESTBTC(universeId)}
  bind:selectedNetwork
  {validateAmount}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value">
    {replacePlaceholders($i18n.accounts.ckbtc_transaction_description, {
      $token: token.symbol,
    })}
  </p>
  <BitcoinEstimatedFee
    slot="additional-info-form"
    {selectedNetwork}
    amount={userAmount}
    minterCanisterId={canisters.minterCanisterId}
    bind:bitcoinEstimatedFee
  />
  <BitcoinEstimatedFeeDisplay
    {bitcoinEstimatedFee}
    slot="additional-info-review"
  />
</TransactionModal>
