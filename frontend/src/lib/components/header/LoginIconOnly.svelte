<script lang="ts">
  import { IconLogin } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutAuthReady } from "$lib/stores/layout.store";

  // TODO: Same code as in SignIn.svelte maybe we can refactore
  const signIn = async () => {
    const onError = (err: unknown) =>
      toastsError({
        labelKey: "error.sign_in",
        err,
      });

    await authStore.signIn(onError);
  };
</script>

<button
  data-tid="toolbar-login"
  class="icon-only toggle"
  on:click={signIn}
  aria-label={$i18n.auth.login}
  disabled={!$layoutAuthReady}
>
  <IconLogin />
</button>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/header";

  button {
    justify-self: flex-end;

    @include header.button(--brand-sea-buckthorn);
  }
</style>
