<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  data-tid="thumb-down"
  fill="currentColor"
  height={size}
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="m13.28 10.79-3.967 4.963a.329.329 0 0 1-.5.016 1.316 1.316 0 0 1-.302-1.212l.56-2.188H4.469a1.046 1.046 0 0 1-1.004-.743c-.043-.143-.036-.273-.036-.441v-.79a3 3 0 0 1 .233-1.16l1.83-4.368c.227-.43.555-.92 1.04-.922h4.75a2 2 0 0 1 2 2v4.845Z"
  />
  <rect
    height="6.826"
    rx=".5"
    transform="rotate(-180 16.572 10.771)"
    width="2.646"
    x="16.572"
    y="10.771"
  />
</svg>
