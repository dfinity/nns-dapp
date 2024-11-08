<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm>
  <div data-tid="remove-current-user-hotkey-confirmation" class="wrapper">
    <h4>{$i18n.neurons.remove_user_hotkey_confirm_title}</h4>
    <p>{$i18n.neurons.remove_user_hotkey_confirm_text}</p>
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

  .wrapper {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>
