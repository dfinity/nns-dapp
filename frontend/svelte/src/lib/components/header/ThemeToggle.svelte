<script lang="ts">
  import Toggle from "../ui/Toggle.svelte";
  import IconLightMode from "../../icons/IconLightMode.svelte";
  import IconDarkMode from "../../icons/IconDarkMode.svelte";

  import { Theme } from "../../types/theme";
  import { themeStore } from "../../stores/theme.store";
  import { i18n } from "../../stores/i18n";

  const switchTheme = ({ detail }: CustomEvent<boolean>) =>
    themeStore.select(detail ? Theme.DARK : Theme.LIGHT);

  let checked: boolean;
  $: checked = $themeStore === Theme.DARK;
</script>

<div class="theme-toggle" data-tid="theme-toggle">
  <span>{$i18n.theme.theme}</span>

  <div class="toggle">
    <IconLightMode />
    <Toggle
      bind:checked
      on:nnsToggle={switchTheme}
      ariaLabel={$i18n.theme.switch_theme}
    />
    <IconDarkMode />
  </div>
</div>

<style lang="scss">
  .theme-toggle {
    display: flex;
    align-items: center;

    font-size: var(--font-size-h4);
    line-height: var(--line-height-title);

    padding: 0 var(--padding-0_5x);
    gap: var(--padding);
  }

  span {
    margin-right: var(--padding-0_5x);
  }

  .toggle {
    display: flex;
    align-items: center;
    grid-template-columns: repeat(3, auto);
    grid-column-gap: 2px;

    :global(svg) {
      width: 16px;
      height: 16px;

      &:first-of-type {
        margin-right: calc(var(--padding-0_5x) / 2);
      }
    }
  }
</style>
