<script lang="ts">
  import { Checkbox } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let conditionsToAccept: string | undefined = undefined;
  export let areConditionsAccepted = false;
</script>

{#if nonNullish(conditionsToAccept)}
  <div data-tid="additional-info-form-component" class="additional-info">
    <Checkbox
      text="block"
      inputId="agree"
      checked={areConditionsAccepted}
      on:nnsChange={() => (areConditionsAccepted = !areConditionsAccepted)}
    >
      <span data-tid="conditions">{conditionsToAccept}</span>
    </Checkbox>
  </div>
{/if}

<style lang="scss">
  .additional-info {
    --checkbox-label-order: 1;
    --padding: var(--padding-2x);
    --checkbox-padding: var(--padding) 0;
  }
</style>
