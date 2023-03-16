<script lang="ts">
  import SnsWallet from "$lib/pages/SnsWallet.svelte";
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";

  export let accountIdentifier: string | undefined | null = undefined;
</script>

<SnsWallet {accountIdentifier} />

<AccountsModals />
