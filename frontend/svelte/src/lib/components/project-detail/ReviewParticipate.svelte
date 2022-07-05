<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import IconWarning from "../../icons/IconWarning.svelte";
  import { i18n } from "../../stores/i18n";
  import { mainTransactionFeeStoreAsIcp } from "../../stores/transaction-fees.store";
  import type { Account } from "../../types/account";
  import { convertNumberToICP } from "../../utils/icp.utils";
  import Icp from "../ic/ICP.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  export let account: Account;
  export let amount: number;

  let icpAmount: ICP;
  $: icpAmount = convertNumberToICP(amount);

  let accepted: boolean = false;
  const toggelAccept = () => (accepted = !accepted);

  const participate = () => {
    // TODO: https://dfinity.atlassian.net/browse/L2-797
  };

  const dispatcher = createEventDispatcher();
  const back = () => {
    dispatcher("nnsBack");
  };
</script>

<div data-tid="sns-swap-participate-step-2">
  <div class="info">
    <KeyValuePair>
      <span slot="key">Source</span>
      <Icp slot="value" singleLine icp={account.balance} />
    </KeyValuePair>
    <div>
      <p>{`${$i18n.accounts.main_account} ${account.identifier}`}</p>
    </div>
    <div class="highlight">
      <div class="align-right">
        <!-- TODO: Icon https://dfinity.atlassian.net/browse/L2-814 -->
        <Icp icp={icpAmount} inline />
        <span>
          <Icp icp={$mainTransactionFeeStoreAsIcp} singleLine />
          {$i18n.sns_project_detail.transaction_fee}
        </span>
      </div>
    </div>
    <div>
      <h5>{$i18n.accounts.destination}</h5>
      <!-- TODO: What is this? Question pending to be answered -->
      <p>Entrepot 1239871294879871249123</p>
    </div>
    <div>
      <h5>{$i18n.sns_project_detail.description}</h5>
      <p>{$i18n.sns_project_detail.participate_swap_description}</p>
    </div>
  </div>
  <div class="actions">
    <div class="warning">
      <span class="icon"><IconWarning size="48px" /></span>
      <span>{$i18n.sns_project_detail.participate_swap_warning}</span>
    </div>
    <!-- TODO: New checkbox https://dfinity.atlassian.net/browse/L2-811 -->
    <Checkbox
      text="block"
      inputId="agree"
      checked={accepted}
      on:nnsChange={toggelAccept}
    >
      {$i18n.sns_project_detail.understand_agree}
    </Checkbox>
    <div class="buttons">
      <button
        class="small secondary"
        data-tid="sns-swap-participate-button-back"
        on:click={back}>{$i18n.sns_project_detail.edit_transaction}</button
      >
      <button
        class="small primary"
        data-tid="sns-swap-participate-button-execute"
        disabled={!accepted}
        on:click={participate}>{$i18n.sns_project_detail.execute}</button
      >
    </div>
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/modal";

  .highlight {
    padding: var(--padding-2x);
    display: flex;
    justify-content: center;
    align-items: center;

    .align-right {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
    }
  }

  .actions {
    margin-top: var(--padding-4x);
    .warning {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: var(--padding-2x);

      .icon {
        color: var(--warning-emphasis);
      }
    }

    :global(label) {
      order: 1;
    }
    .buttons {
      @include modal.bottom-buttons;
    }
  }
</style>
