<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { login } from "$lib/services/auth.services";
  import { i18n } from "$lib/stores/i18n";
  import { layoutAuthReady } from "$lib/stores/layout.store";
  import { Spinner } from "@dfinity/gix-components";

  let disabled = true;
  $: disabled = $authSignedInStore || !$layoutAuthReady;
</script>

<button on:click={login} data-tid="login-button" class="primary" {disabled}>
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
