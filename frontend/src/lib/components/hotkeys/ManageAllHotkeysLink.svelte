<script lang="ts">
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import { IconEast } from "$lib/gix";
</script>

<a data-tid="manage-all-hotkeys-link" href={AppPath.Hotkeys}>
  {$i18n.hotkeys.manage_on_all_neurons}
  <IconEast />
</a>

<style lang="scss">
  a {
    display: inline-flex;
    align-items: center;
    gap: var(--padding-0_5x);
    color: var(--primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    :global(svg) {
      width: 16px;
      height: 16px;
    }
  }
</style>
