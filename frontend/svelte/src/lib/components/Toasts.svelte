<script lang="ts">
  import { toastsStore } from "../stores/toasts.store";
  import Toast from "./Toast.svelte";
</script>

{#each $toastsStore as msg, i}
  <Toast {msg} index={i} />
{/each}
