<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { toggleCommunityFund } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import {
    hasJoinedCommunityFund,
    isHotKeyControllable,
  } from "$lib/utils/neuron.utils";
  import { Html } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  let isHotkeyControlled: boolean;
  $: isHotkeyControlled = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });

  const joinFund = async () => {
    startBusy({ initiator: "toggle-community-fund" });
    const successMessageKey = isCommunityFund
      ? "neuron_detail.leave_community_fund_success"
      : "neuron_detail.join_community_fund_success";
    const id = await toggleCommunityFund(neuron);
    if (id !== undefined) {
      toastsSuccess({
        labelKey: successMessageKey,
      });
    }
    closeModal();
    stopBusy("toggle-community-fund");
  };

  const dispatcher = createEventDispatcher();
  const closeModal = () => dispatcher("nnsClose");
</script>

<ConfirmationModal
  testId="join-community-fund-modal-component"
  on:nnsClose
  on:nnsConfirm={joinFund}
>
  <div data-tid="join-community-fund-modal">
    <h4>{$i18n.core.confirm}</h4>
    {#if isCommunityFund}
      <p>
        <Html text={$i18n.neuron_detail.leave_community_fund_description} />
      </p>
    {:else}
      <p>{$i18n.neuron_detail.join_community_fund_description_1}</p>
      <p>{$i18n.neuron_detail.join_community_fund_description_2}</p>
      {#if isHotkeyControlled}
        <p class="description">
          {$i18n.neuron_detail.join_community_fund_hw_alert_1}
        </p>
        <p class="description">
          {$i18n.neuron_detail.join_community_fund_hw_alert_2}
        </p>
      {/if}
    {/if}
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";
  div {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>
