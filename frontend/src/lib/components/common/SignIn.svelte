<script lang="ts">
  import { signIn as signInService } from "$lib/services/auth.services";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Spinner } from "@dfinity/gix-components";
  import { layoutAuthReady } from "$lib/stores/layout.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    const onError = (err: unknown) =>
      toastsError({
        labelKey: "error.sign_in",
        err,
      });

    await signInService(onError);
  };

  let disabled = true;
  $: disabled = $authSignedInStore || !$layoutAuthReady;
</script>

<button on:click={signIn} data-tid="login-button" class="primary" {disabled}>
  <slot>{$i18n.auth.login}</slot>
  {#if disabled}
    <div class="spinner">
      <Spinner size="small" inline />
    </div>
  {/if}
</button>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;

    .spinner {
      margin-left: var(--padding);
    }
  }
</style>
