<script lang="ts">
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import SyncIndicator from "$lib/components/header/SyncIndicator.svelte";
</script>

<div>
  <SyncIndicator />
  <AccountMenu />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
  }
</style>
