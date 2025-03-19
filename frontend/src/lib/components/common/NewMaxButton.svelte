<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  export let disabled = false;
  // TODO(yhabib): remove duplication with MaxButton once designs are unified
</script>

<button data-tid="max-button" on:click|preventDefault type="button" {disabled}>
  {$i18n.core.max}
</button>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  button {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
    color: var(--button-primary);
    text-decoration: none;
    @include fonts.h5(true);
  }
</style>
