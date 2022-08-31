<script lang="ts">
  import Checkbox from "../../../components/ui/Checkbox.svelte";
  import { ICON_SIZE_LARGE } from "../../../constants/style.constants";
  import IconWarning from "../../../icons/IconWarning.svelte";
  import { i18n } from "../../../stores/i18n";

  export let accepted: boolean;
</script>

<div class="additional-info-review">
  <div class="warning">
    <span class="icon"><IconWarning size={ICON_SIZE_LARGE} /></span>
    <span>{$i18n.sns_project_detail.participate_swap_warning}</span>
  </div>
  <Checkbox text="block" inputId="agree" checked={accepted} on:nnsChange>
    {$i18n.sns_project_detail.understand_agree}
  </Checkbox>
</div>

<style lang="scss">
  .additional-info-review {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

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
