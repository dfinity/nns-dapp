<script lang="ts">
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import Tooltip from "../ui/Tooltip.svelte";
  import { createEventDispatcher } from "svelte";
  import {themeStore} from "../../stores/theme.store";

  const dispatch = createEventDispatcher();
</script>

<Tooltip id="back" text={$i18n.core.back} slot="start">
  <button
    class={`back icon-only ${$themeStore}`}
    on:click|stopPropagation={() => dispatch("nnsBack")}
    aria-label={$i18n.core.back}><IconBackIosNew /></button
  >
</Tooltip>

<style lang="scss">
  @use "../../themes/mixins/header";
  @use "../../themes/mixins/media";

  .dark {
    @include header.button(--brand-sea-buckthorn);

    @include media.min-width(xlarge) {
      @include header.button(--brand-flamingo);
    }
  }

  .light {
    @include header.button(--blue-500);
  }
</style>
