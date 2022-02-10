<script lang="ts">
  import { toastsStore } from "../../stores/toasts.store";
  import Toast from "./Toast.svelte";
</script>

<!-- Display one toast message at a time -->
{#if $toastsStore.length > 0}
  <Toast msg={$toastsStore[0]} />
{/if}
