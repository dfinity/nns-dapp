<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Html } from "@dfinity/gix-components";

  export let hasAutoStakeOn: boolean;
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm>
  <div data-tid="auto-stake-confirm-modal">
    <h4>{$i18n.core.confirm}</h4>
    <p>
      <Html
        text={hasAutoStakeOn
          ? $i18n.neuron_detail.auto_stake_maturity_off
          : $i18n.neuron_detail.auto_stake_maturity_on}
      />
    </p>
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
