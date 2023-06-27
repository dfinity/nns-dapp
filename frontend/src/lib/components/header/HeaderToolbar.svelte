<script lang="ts">
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import Sync from "$lib/components/header/Sync.svelte";
</script>

<div>
  <Sync />
  <AccountMenu />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
  }
</style>
