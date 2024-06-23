<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconSubdirectory } from "@dfinity/gix-components";

  export let disabled = false;
</script>

<button
  data-tid="max-button"
  on:click|preventDefault
  class="ghost"
  type="button"
  {disabled}
>
  <span class="icon">
    <IconSubdirectory />
  </span>
  {$i18n.core.max}
</button>

<style lang="scss">
  button {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
