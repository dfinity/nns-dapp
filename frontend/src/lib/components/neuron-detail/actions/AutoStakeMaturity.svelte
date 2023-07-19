<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Checkbox } from "@dfinity/gix-components";

  export let hasAutoStakeOn: boolean;
  export let disabled = false;
</script>

<div class="auto-stake" data-tid="auto-stake-maturity-checkbox-component">
  <Checkbox
    preventDefault
    inputId="auto-stake-maturity-checkbox"
    checked={hasAutoStakeOn}
    on:nnsChange
    {disabled}
  >
    <span>{$i18n.neuron_detail.auto_stake_maturity}</span>
  </Checkbox>
</div>

<style lang="scss">
  .auto-stake {
    --checkbox-label-order: 1;
  }
</style>
