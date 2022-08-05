<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import type { AccountIdentifier } from "@dfinity/nns";
  import { createEventDispatcher, getContext } from "svelte";
  import IconSouth from "../../icons/IconSouth.svelte";
  import IconWarning from "../../icons/IconWarning.svelte";
  import FooterModal from "../../modals/FooterModal.svelte";
  import {
    getSwapAccount,
    participateInSwap,
  } from "../../services/sns.services";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import { mainTransactionFeeStoreAsIcp } from "../../stores/transaction-fees.store";
  import type { Account } from "../../types/account";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { convertNumberToICP } from "../../utils/icp.utils";
  import { nonNullish, valueSpan } from "../../utils/utils";
  import Icp from "../ic/ICP.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import { ICON_SIZE_LARGE } from "../../constants/style.constants";

  export let account: Account;
  export let amount: number;

  const { store, reload }: ProjectDetailContext =
    getContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY);

  let icpAmount: ICP;
  $: icpAmount = convertNumberToICP(amount);

  let destinationAddress: AccountIdentifier | undefined;
  $: (async () => {
    destinationAddress =
      $store.summary?.swapCanisterId !== undefined
        ? await getSwapAccount($store.summary?.swapCanisterId)
        : undefined;
  })();

  let accepted: boolean = false;
  const toggelAccept = () => (accepted = !accepted);

  const dispatcher = createEventDispatcher();
  const participate = async () => {
    // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-798
    if (nonNullish($store.summary)) {
      startBusy({
        initiator: "project-participate",
      });
      const { success } = await participateInSwap({
        account,
        amount: icpAmount,
        rootCanisterId: $store.summary.rootCanisterId,
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

  const back = () => {
    dispatcher("nnsBack");
  };
</script>

<div data-tid="sns-swap-participate-step-2">
  <div class="info">
    <KeyValuePair>
      <span slot="key">{$i18n.accounts.source}</span>
      <Icp slot="value" singleLine icp={account.balance} />
    </KeyValuePair>
    <div>
      <p data-tid="sns-swap-participate-main-account">
        {@html replacePlaceholders($i18n.accounts.main_account, {
          $identifier: valueSpan(account.identifier),
        })}
      </p>
    </div>
    <div class="highlight">
      <span class="icon">
        <IconSouth />
      </span>
      <div class="align-right">
        <Icp icp={icpAmount} inline />
        <span>
          <Icp icp={$mainTransactionFeeStoreAsIcp} singleLine />
          {$i18n.sns_project_detail.transaction_fee}
        </span>
      </div>
    </div>
    <div>
      <h5>{$i18n.accounts.destination}</h5>
      <p data-tid="sns-swap-participate-project-name">
        {$store.summary?.metadata.name}
      </p>
      {#if destinationAddress !== undefined}
        <p class="value">{destinationAddress.toHex()}</p>
      {/if}
    </div>
    <div>
      <h5>{$i18n.sns_project_detail.description}</h5>
      <p>{$i18n.sns_project_detail.participate_swap_description}</p>
    </div>
  </div>
  <div class="actions">
    <div class="warning">
      <span class="icon"><IconWarning size={ICON_SIZE_LARGE} /></span>
      <span class="description"
        >{$i18n.sns_project_detail.participate_swap_warning}</span
      >
    </div>
    <Checkbox
      text="block"
      inputId="agree"
      checked={accepted}
      on:nnsChange={toggelAccept}
    >
      {$i18n.sns_project_detail.understand_agree}
    </Checkbox>
    <FooterModal>
      <button
        class="small secondary"
        data-tid="sns-swap-participate-button-back"
        on:click={back}>{$i18n.sns_project_detail.edit_transaction}</button
      >
      <button
        class="small primary"
        data-tid="sns-swap-participate-button-execute"
        disabled={!accepted || $busy}
        on:click={participate}>{$i18n.sns_project_detail.execute}</button
      >
    </FooterModal>
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/modal";

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

  .actions {
    margin-top: var(--padding-4x);

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    --select-padding: var(--padding-2x) 0;

    .warning {
      display: grid;
      grid-template-columns: var(--icon-size-large) 1fr;
      gap: var(--padding-2x);

      .icon {
        color: var(--warning-emphasis);
      }
    }

    :global(label) {
      order: 1;
    }
  }
</style>
