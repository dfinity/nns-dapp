<script lang="ts">
  import Toggle from "$lib/gix/components/Toggle.svelte";
  import IconDarkMode from "$lib/gix/icons/IconDarkMode.svelte";
  import IconLightMode from "$lib/gix/icons/IconLightMode.svelte";
  import { i18n } from "$lib/gix/stores/i18n";
  import { themeStore } from "$lib/gix/stores/theme.store";
  import { Theme } from "$lib/gix/types/theme";

  const switchTheme = ({ detail }: CustomEvent<boolean>) =>
    themeStore.select(detail ? Theme.DARK : Theme.LIGHT);

  let checked: boolean;
  $: checked = $themeStore !== Theme.LIGHT;
</script>

<div class="theme-toggle" data-tid="theme-toggle">
  <div class="toggle">
    <IconLightMode />
    <Toggle
      ariaLabel={$i18n.theme.switch_theme}
      bind:checked
      on:nnsToggle={switchTheme}
    />
    <IconDarkMode />
  </div>
</div>

<style lang="scss">
  .theme-toggle {
    display: flex;
    align-items: center;

    font-size: var(--font-size-h4);
    line-height: var(--line-height-h4);

    padding: 0 var(--padding-0_5x);
    gap: var(--padding);
  }

  .toggle {
    display: flex;
    align-items: center;
    grid-template-columns: repeat(3, auto);
    grid-column-gap: 2px;

    :global(svg) {
      width: var(--padding-2x);
      height: var(--padding-2x);

      &:first-of-type {
        margin-right: calc(var(--padding-0_5x) / 2);
      }
    }
  }
</style>
