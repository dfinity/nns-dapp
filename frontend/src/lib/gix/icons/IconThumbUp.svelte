<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  data-tid="thumb-up"
  fill="currentColor"
  height={size}
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="m6.72 9.21 3.967-4.963a.329.329 0 0 1 .5-.016c.299.327.412.783.302 1.212l-.56 2.188h4.603a1.046 1.046 0 0 1 1.004.743c.043.143.036.273.036.441v.802a3 3 0 0 1-.224 1.138l-1.793 4.373s-.201.492-.393.662c-.191.17-.438.264-.693.265h-4.75a2 2 0 0 1-2-2V9.21Z"
  />
  <rect height="6.826" rx=".5" width="2.646" x="3.428" y="9.229" />
</svg>
