<script lang="ts">
  import Modal from "$lib/gix/components/Modal.svelte";
  import type { OnEventCallback } from "$lib/gix/types/event-modifiers";

  interface Props {
    onParentClick: OnEventCallback;
    childTestId?: string;
    visible: boolean;
    disablePointerEvents?: boolean;
  }

  let {
    onParentClick,
    childTestId,
    visible,
    disablePointerEvents = false,
  }: Props = $props();
</script>

<div onclick={onParentClick} onkeypress={() => {}} role="button" tabindex="-1">
  <Modal {disablePointerEvents} testId={childTestId} {visible}>Content</Modal>
</div>
