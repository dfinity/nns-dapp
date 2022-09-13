<script lang="ts">
  import { TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import IconSouth from "../../../icons/IconSouth.svelte";
  import FooterModal from "../../FooterModal.svelte";
  import { busy } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import { mainTransactionFeeStoreAsToken } from "../../../derived/main-transaction-fee.derived";
  import type { Account } from "../../../types/account";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { valueSpan } from "../../../utils/utils";
  import AmountDisplay from "../../../components/ic/AmountDisplay.svelte";
  import KeyValuePair from "../../../components/ui/KeyValuePair.svelte";
  import { sanitize } from "../../../utils/html.utils";
  import type { NewTransaction } from "../../../types/transaction.context";

  export let transaction: NewTransaction;
  export let disableSubmit: boolean;

  let sourceAccount: Account;
  let amount: number;
  let destinationAddress: string;
  $: ({ sourceAccount, amount, destinationAddress } = transaction);

  // If we made it this far, the number is valid.
  let icpAmount: TokenAmount;
  $: icpAmount = TokenAmount.fromNumber({ amount }) as TokenAmount;

  const dispatcher = createEventDispatcher();
  const submit = () => {
    dispatcher("nnsSubmit", transaction);
  };

  const back = () => {
    dispatcher("nnsBack");
  };
</script>

<div data-tid="transaction-step-2">
  <div class="info">
    <KeyValuePair>
      <span slot="key">{$i18n.accounts.source}</span>
      <AmountDisplay slot="value" singleLine amount={sourceAccount.balance} />
    </KeyValuePair>
    <div>
      <p data-tid="transaction-review-source-account">
        {@html replacePlaceholders($i18n.accounts.main_account, {
          $identifier: valueSpan(sanitize(destinationAddress)),
        })}
      </p>
    </div>
    <div class="highlight">
      <span class="icon">
        <IconSouth />
      </span>
      <div class="align-right">
        <AmountDisplay amount={icpAmount} inline />
        <span>
          <AmountDisplay amount={$mainTransactionFeeStoreAsToken} singleLine />
          {$i18n.accounts.new_transaction_fee}
        </span>
      </div>
    </div>
    <div>
      <h5>{$i18n.accounts.destination}</h5>
      <slot name="destination-info" />
      <p class="value">{destinationAddress}</p>
    </div>
    <div>
      <h5>{$i18n.accounts.description}</h5>
      <slot name="description" />
    </div>
  </div>
  <div class="actions">
    <slot name="additional-info" />
    <FooterModal>
      <button
        class="small secondary"
        data-tid="transaction-button-back"
        on:click={back}>{$i18n.accounts.edit_transaction}</button
      >
      <button
        class="small primary"
        data-tid="transaction-button-execute"
        disabled={$busy || disableSubmit}
        on:click={submit}>{$i18n.accounts.execute}</button
      >
    </FooterModal>
  </div>
</div>

<style lang="scss">
  @use "../../../themes/mixins/modal";

  .highlight {
    padding: var(--padding-2x);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--padding);

    .icon {
      color: var(--primary);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .align-right {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .actions {
    margin-top: var(--padding-4x);

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    --select-padding: var(--padding-2x) 0;
  }
</style>
