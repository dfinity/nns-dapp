<script lang="ts">
  import Toasts from "$lib/gix/components/Toasts.svelte";
  import type { ToastPosition } from "$lib/gix/types/toast";

  export let position: ToastPosition = "bottom";
  export let maxVisible: number | undefined = undefined;
</script>

<!-- We need the wrapper to avoid having an error in the tests -->
<!-- TypeError: Cannot read properties of null (reading 'removeChild') -->
<!-- https://github.com/sveltejs/svelte/issues/6037 -->
<div>
  <Toasts {maxVisible} {position} />
</div>
