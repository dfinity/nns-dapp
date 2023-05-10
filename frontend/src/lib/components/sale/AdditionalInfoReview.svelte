<script lang="ts">
  import { Checkbox } from "@dfinity/gix-components";
  import { ICON_SIZE_LARGE } from "$lib/constants/layout.constants";
  import { IconWarning } from "@dfinity/gix-components";
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

    .warning {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--padding-2x);

      .icon {
        color: var(--warning-emphasis);
      }
    }

    :global(label) {
      order: 1;
    }
  }
</style>
