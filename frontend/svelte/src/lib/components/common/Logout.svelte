<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { logout } from "../../services/auth.services";
</script>

<button data-tid="logout" on:click={() => logout({})} class="text"
  >{$i18n.header.logout}</button
>

<style lang="scss">
  button {
    justify-self: flex-end;
  }
</style>
