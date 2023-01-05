<script lang="ts">
  import { MenuItem, IconNorthEast } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import LoginFooter from "$lib/components/login/LoginFooter.svelte";
</script>

<MenuItem
  href="https://internetcomputer.org"
  rel="noopener noreferrer"
  target="_blank"
>
  <span>internetcomputer.org <IconNorthEast /></span>
</MenuItem>

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
</style>
