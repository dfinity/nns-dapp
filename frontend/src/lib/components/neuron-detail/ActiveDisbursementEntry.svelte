<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let formattedTime: string;
  export let formattedAccount: string;
  export let formattedAmount: string;
</script>

<div class="disbursement" data-tid="active-disbursement-entry-component">
  <span class="icon">
    <IconClockNoFill size="24px" />
  </span>

  <span class="info">
    <span class="description" data-tid="description">
      {replacePlaceholders(
        $i18n.neuron_detail.view_active_disbursements_entry_description,
        {
          $time: formattedTime,
          $account: formattedAccount,
        }
      )}
    </span>
    <span class="value" data-tid="maturity">
      {replacePlaceholders(
        $i18n.neuron_detail.view_active_disbursements_maturity,
        {
          $maturity: formattedAmount,
        }
      )}
    </span>
  </span>
</div>

<style lang="scss">
  .disbursement {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
  }

  .icon {
    flex: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }
</style>
