<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";

  // TODO(GIX-1071): constant for /u/ and for /accounts?
  const goHome = async () =>
    await goto(`/accounts?u=${OWN_CANISTER_ID}`, { replaceState: true });
</script>

<Layout>
  <main>
    <h1>Oops!</h1>

    <p>NNS-dapp can't seem to find the page you're looking for.</p>

    <p class="description">
      Error code: {$page.status} ({$page.error?.message})
    </p>

    <button on:click={goHome} class="primary"> Go home </button>
  </main>
</Layout>

<style lang="scss">
  button {
    margin-top: var(--padding-2x);
  }
</style>
