<script lang="ts">
  import Toggle from "../ui/Toggle.svelte";

  import { Theme } from "../../types/theme";
  import { themeStore } from "../../stores/theme.store";

  const switchTheme = ({detail}: CustomEvent<boolean>) =>
          themeStore.select(detail ? Theme.LIGHT : Theme.DARK);

  let checked: boolean;
  $: checked = $themeStore === Theme.LIGHT;
</script>

<div>
  <span>Theme</span>

  <Toggle bind:checked on:nnsToggle={switchTheme} />
</div>

<style lang="scss">
  div {
    display: flex;

    font-size: var(--font-size-h4);
    line-height: var(--line-height-title);

    padding: 0 var(--padding-0_5x);
    gap: var(--padding);
  }
</style>
