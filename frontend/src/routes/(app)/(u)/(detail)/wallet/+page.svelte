<script lang="ts">
  import Wallet from "$lib/routes/Wallet.svelte";

  // Preloaded by +page.ts
  export let data: { account: string | null | undefined };

  let accountIdentifier: string | null | undefined;
  $: ({ account: accountIdentifier } = data);
</script>

<Wallet {accountIdentifier} />
