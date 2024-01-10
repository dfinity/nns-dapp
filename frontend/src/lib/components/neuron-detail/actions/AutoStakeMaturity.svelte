<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Checkbox } from "@dfinity/gix-components";

  export let hasAutoStakeOn: boolean;
  export let disabled = false;
</script>

<Checkbox
  preventDefault
  testId="auto-stake-maturity-checkbox-component"
  inputId="auto-stake-maturity-checkbox"
  checked={hasAutoStakeOn}
  on:nnsChange
  {disabled}
  --checkbox-label-order="1"
>
  <span>{$i18n.neuron_detail.auto_stake_maturity}</span>
</Checkbox>
