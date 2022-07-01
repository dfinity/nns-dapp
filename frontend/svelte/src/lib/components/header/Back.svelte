<script lang="ts">
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<button
  class="back icon-only"
  data-tid="back"
  on:click|stopPropagation={() => dispatch("nnsBack")}
  aria-label={$i18n.core.back}><IconBackIosNew /></button
>

<style lang="scss">
  @use "../../themes/mixins/header";
  @use "../../themes/mixins/media";

  button {
    @include header.button(--primary-tint);
  }
</style>
