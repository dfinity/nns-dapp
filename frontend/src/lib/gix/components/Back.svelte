<script lang="ts">
  import IconBack from "$lib/gix/icons/IconBack.svelte";
  import { i18n } from "$lib/gix/stores/i18n";
  import type { OnEventCallback } from "$lib/gix/types/event-modifiers";
  import { stopPropagation } from "$lib/gix/utils/event-modifiers.utils";

  interface Props {
    onBack: OnEventCallback;
  }

  let { onBack }: Props = $props();
</script>

<button
  class="back icon-only"
  aria-label={$i18n.core.back}
  data-tid="back"
  onclick={stopPropagation(onBack)}
  type="button"><IconBack /></button
>

<style lang="scss">
  @use "../styles/mixins/header";
  @use "../styles/mixins/media";

  .back {
    @include header.button(--primary-tint);
  }
</style>
