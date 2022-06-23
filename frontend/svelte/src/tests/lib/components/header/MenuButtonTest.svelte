<script lang="ts">
  import MenuButton from "../../../../lib/components/header/MenuButton.svelte";

  export let spy: (open: boolean) => void;

  let open: boolean = false;

  $: open, spy(open);
</script>

<MenuButton bind:open />
