<script lang="ts">
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import Tooltip from "../ui/Tooltip.svelte";
  import { triggerDebugReport } from "../../utils/dev.utils";
  import Header from "../ui/Header.svelte";
  import Toolbar from "../ui/Toolbar.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<Header>
  <Toolbar>
    <Tooltip id="back" text={$i18n.core.back} slot="start">
      <button
        class="back icon-only"
        on:click|stopPropagation={() => dispatch("nnsBack")}
        aria-label={$i18n.core.back}><IconBackIosNew /></button
      >
    </Tooltip>
    <h4 use:triggerDebugReport><slot /></h4>
  </Toolbar>
</Header>

<style lang="scss">
  @use "../../themes/mixins/header";

  .back {
    @include header.button(--brand-sea-buckthorn);
  }

  h4 {
    @include header.title;
  }
</style>
