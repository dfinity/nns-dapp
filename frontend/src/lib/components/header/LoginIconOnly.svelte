<script lang="ts">
  import { login } from "$lib/services/auth.services";
  import { i18n } from "$lib/stores/i18n";
  import { layoutAuthReady } from "$lib/stores/layout.store";
  import { IconLogin } from "@dfinity/gix-components";
</script>

<button
  data-tid="toolbar-login"
  class="icon-only toggle"
  on:click={login}
  aria-label={$i18n.auth.login}
  disabled={!$layoutAuthReady}
>
  <IconLogin />
</button>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  button {
    justify-self: flex-end;

    @include header.button(--primary-tint);
  }
</style>
