<script lang="ts">
  import {
    MenuItem,
    IconNorthEast,
    ThemeToggle,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import LoginFooter from "$lib/components/login/LoginFooter.svelte";
</script>

<div class="menu-items">
  <MenuItem
    href="https://internetcomputer.org/nns"
    rel="noopener noreferrer"
    target="_blank"
  >
    <span>{$i18n.auth.about} <IconNorthEast /></span>
  </MenuItem>

  <MenuItem
    href="https://dashboard.internetcomputer.org/governance"
    rel="noopener noreferrer"
    target="_blank"
  >
    <span>{$i18n.auth.voting_rewards} <IconNorthEast /></span>
  </MenuItem>
</div>

<div class="theme" on:click|stopPropagation>
  <span>{$i18n.theme.switch_theme}</span><ThemeToggle />
</div>

<LoginFooter presentation="menu" />

<style lang="scss">
  span {
    text-decoration: none;

    :global(svg) {
      margin-left: var(--padding);
      vertical-align: bottom;
      width: 16px;
      height: 16px;
    }
  }

  .theme {
    display: flex;
    gap: var(--padding);
    padding: var(--padding-3x) var(--padding) var(--padding-3x)
      var(--padding-3x);
    width: calc(var(--menu-width) - var(--padding-6x));
  }

  .menu-items {
    :global(a > span) {
      margin: 0 var(--padding);
    }
  }

  .menu-items,
  .theme {
    z-index: var(--z-index);
  }
</style>
