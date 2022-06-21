<script lang="ts">
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import Tooltip from "../ui/Tooltip.svelte";

  const dispatch = createEventDispatcher();
</script>

<Tooltip id="back" text={$i18n.core.back} slot="start">
  <button
    class="back icon-only"
    on:click|stopPropagation={() => dispatch("nnsBack")}
    aria-label={$i18n.core.back}><IconBackIosNew /></button
  >
</Tooltip>

<style lang="scss">
  @use "../../themes/mixins/header";

  .back {
    @include header.button(--brand-sea-buckthorn);
  }
</style>
