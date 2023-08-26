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
</div>

<style lang="scss">
  .disbursement {
    display: grid;
    grid-template-columns: var(--padding-4x) auto;
    align-items: center;
    gap: var(--padding-05x);
  }

  .value {
    grid-column: 2;
  }
</style>
