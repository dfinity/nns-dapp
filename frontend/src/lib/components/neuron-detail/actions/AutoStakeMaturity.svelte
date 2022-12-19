<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Checkbox } from "@dfinity/gix-components";

  export let hasAutoStakeOn: boolean;
</script>

<div class="auto-stake">
  <Checkbox
    preventDefault
    inputId="auto-stake-maturity-checkbox"
    checked={hasAutoStakeOn}
    on:nnsChange
  >
    <span>{$i18n.neuron_detail.auto_stake_maturity}</span>
  </Checkbox>
</div>

<style lang="scss">
  .auto-stake {
    padding: var(--padding-2x) 0 0;

    --checkbox-label-order: 1;
    --checkbox-padding: var(--padding) 0;
  }
</style>
