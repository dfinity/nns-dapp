<script lang="ts">
  import { Checkbox } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let accepted = false;
  const toggleAccept = () => (accepted = !accepted);
</script>

<div class="additional-info-review">
  <Checkbox
    text="block"
    inputId="agree"
    checked={accepted}
    on:nnsChange={toggleAccept}
  >
    {$i18n.sns_project_detail.understand_agree}
  </Checkbox>
</div>

<style lang="scss">
  .additional-info-review {
    display: flex;
    flex-direction: column;
    --checkbox-label-order: 1;
    --padding: var(--padding-2x);
    --checkbox-padding: var(--padding) 0;

    :global(label) {
      order: 1;
    }
  }
</style>
