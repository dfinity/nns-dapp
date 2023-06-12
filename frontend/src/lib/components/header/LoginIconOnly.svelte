<script lang="ts">
  import { IconLogin } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutAuthReady } from "$lib/stores/layout.store";
  import { signIn as signInService } from "$lib/services/auth.services";

  // TODO: Same code as in SignIn.svelte maybe we can refactore
  const signIn = async () => {
    const onError = (err: unknown) =>
      toastsError({
        labelKey: "error.sign_in",
        err,
      });

    await signInService(onError);
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
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  button {
    justify-self: flex-end;

    @include header.button(--primary-tint);
  }
</style>
