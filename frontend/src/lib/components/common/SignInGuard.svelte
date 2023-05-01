<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

{#if $authSignedInStore}
  <slot />
{:else}
  <SignIn>
    <slot name="signin-cta">{$i18n.auth.login}</slot>
  </SignIn>
{/if}
