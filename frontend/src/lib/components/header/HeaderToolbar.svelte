<script lang="ts">
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import AccountSyncIndicator from "$lib/components/header/AccountSyncIndicator.svelte";
</script>

<div>
  <AccountSyncIndicator />
  <AccountMenu />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
  }
</style>
