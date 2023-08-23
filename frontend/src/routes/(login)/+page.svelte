<script lang="ts">
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { onMount } from "svelte";

  onMount(() => {
    goto(AppPath.Accounts, { replaceState: true });
  });
</script>
