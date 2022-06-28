<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { logout } from "../../services/auth.services";
  import IconExit from "../../icons/IconExit.svelte";
</script>

<button data-tid="logout" on:click={() => logout({})} class="text"
  ><span>
    <IconExit />
    {$i18n.header.logout}
  </span>
</button>

<style lang="scss">
  button {
    margin: 0;

    :global(svg) {
      width: var(--padding-2x);
    }
  }

  span {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }
</style>
