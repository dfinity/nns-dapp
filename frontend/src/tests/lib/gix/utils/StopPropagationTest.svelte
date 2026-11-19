<script lang="ts">
  import type { OnEventCallback } from "$lib/gix/types/event-modifiers";
  import { stopPropagation } from "$lib/gix/utils/event-modifiers.utils";

  interface Props {
    onParentClick?: OnEventCallback;
    onChildClick?: OnEventCallback;
    childTestId?: string;
  }

  let { onParentClick = () => {}, onChildClick, childTestId }: Props = $props();
</script>

<div onclick={onParentClick} onkeypress={() => {}} role="button" tabindex="-1">
  <button data-tid={childTestId} onclick={stopPropagation(onChildClick)}>
    Click Me
  </button>
</div>
