<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let formattedTime: string;
  export let formattedAccount: string;
  export let formattedAmount: string;
</script>

<div class="disbursement" data-tid="active-disbursement-entry-component">
  <div class="description">
    <IconClockNoFill size="20" />
    <span>
      {replacePlaceholders(
        $i18n.neuron_detail.view_active_disbursements_entry_description,
        {
          $time: formattedTime,
          $account: formattedAccount,
        }
      )}
    </span>
  </div>
  <span class="value">
    {replacePlaceholders(
      $i18n.neuron_detail.view_active_disbursements_maturity,
      {
        $maturity: formattedAmount,
      }
    )}
  </span>
</div>

<style lang="scss">
  .disbursement {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .description {
    display: flex;
    gap: var(--padding);
    align-items: center;
  }
</style>
