<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { Checkbox } from "@dfinity/gix-components";

  export let conditionsToAccept: string | undefined = undefined;
  export let areConditionsAccepted = false;
</script>

<div data-tid="additional-info-form-component" class="additional-info">
  {#if nonNullish(conditionsToAccept)}
    <Checkbox
      text="block"
      inputId="agree"
      checked={areConditionsAccepted}
      on:nnsChange={() => (areConditionsAccepted = !areConditionsAccepted)}
    >
      <span data-tid="conditions">{conditionsToAccept}</span>
    </Checkbox>
  {/if}
</div>

<style lang="scss">
  .additional-info {
    --checkbox-label-order: 1;
    --padding: var(--padding-2x);
    --checkbox-padding: var(--padding) 0;
  }
</style>
