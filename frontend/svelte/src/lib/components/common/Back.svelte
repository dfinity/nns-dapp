<script lang="ts">
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<button
  class="back icon-only"
  on:click|stopPropagation={() => dispatch("nnsBack")}
  aria-label={$i18n.core.back}><IconBackIosNew /></button
>

<style lang="scss">
  @use "../../themes/mixins/header";

  .back {
    @include header.button(--brand-sea-buckthorn);
  }
</style>
