<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { logout } from "$lib/services/auth.services";
  import { IconExit } from "@dfinity/gix-components";
</script>

<button data-tid="logout" on:click={() => logout({})} class="text">
  <IconExit />
  {$i18n.header.logout}
</button>

<style lang="scss">
  button {
    margin: 0;

    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    :global(svg) {
      width: var(--padding-3x);
      height: var(--padding-3x);
    }
  }
</style>
