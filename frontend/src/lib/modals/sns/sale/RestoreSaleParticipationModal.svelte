<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { nanoSecondsToDateTime } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import type { SnsSwapDid } from "@icp-sdk/canisters/sns";

  export let ticket: SnsSwapDid.Ticket;
  export let projectName: string;

  let description: string;
  $: description = replacePlaceholders(
    $i18n.sns_sale.restore_participation_description,
    {
      $amount: formatTokenE8s({ value: ticket.amount_icp_e8s }),
      $project: projectName,
      $time: nanoSecondsToDateTime(ticket.creation_time),
    }
  );
</script>

<ConfirmationModal
  testId="restore-sale-participation-modal"
  yesLabel={$i18n.sns_sale.restore_participation_confirm}
  noLabel={$i18n.sns_sale.restore_participation_cancel}
  on:nnsClose
  on:nnsConfirm
>
  <div class="wrapper">
    <h4>{$i18n.sns_sale.restore_participation_title}</h4>
    <p class="description" data-tid="restore-sale-participation-description">
      {description}
    </p>
    <p class="description">
      {$i18n.sns_sale.restore_participation_note}
    </p>
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../../themes/mixins/confirmation-modal";

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
