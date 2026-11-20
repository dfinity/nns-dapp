<script lang="ts">
  import Modal from "$lib/gix/components/Modal.svelte";

  interface Props {
    visible: boolean;
    disablePointerEvents?: boolean;
    subTitleString?: string;
    onClose?: () => void;
  }

  let {
    visible,
    disablePointerEvents = false,
    subTitleString,
    onClose,
  }: Props = $props();
</script>

<Modal {disablePointerEvents} {onClose} {visible}>
  {#snippet title()}<h3>Test</h3>{/snippet}
  {#snippet subTitle()}<p>{subTitleString}</p>{/snippet}
  {#snippet headerLeft()}<span data-tid="header-left-content"
      >Left Header Content</span
    >{/snippet}
  {#snippet headerRight()}<span data-tid="header-right-content"
      >Right Header Content</span
    >{/snippet}
  Content
</Modal>
