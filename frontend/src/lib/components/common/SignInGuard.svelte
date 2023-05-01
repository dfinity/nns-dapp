<script lang="ts">
  import { authSignedInStore } from "$lib/stores/auth.store";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

{#if $authSignedInStore}
  <slot />
{:else}
  <SignIn>
    <slot name="signin-cta">{$i18n.auth.login}</slot>
  </SignIn>
{/if}
