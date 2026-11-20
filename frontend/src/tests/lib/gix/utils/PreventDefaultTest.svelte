<script lang="ts">
  import type { OnEventCallback } from "$lib/gix/types/event-modifiers";
  import { preventDefault } from "$lib/gix/utils/event-modifiers.utils";

  interface Props {
    onSubmit?: OnEventCallback;
    onButtonClick?: OnEventCallback;
    childTestId?: string;
  }

  let { onSubmit = () => {}, onButtonClick, childTestId }: Props = $props();
</script>

<form onsubmit={onSubmit}>
  <button
    data-tid={childTestId}
    onclick={preventDefault(onButtonClick)}
    type="submit"
  >
    Submit
  </button>
</form>
