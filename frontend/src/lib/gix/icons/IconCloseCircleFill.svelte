<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = DEFAULT_ICON_SIZE }: Props = $props();
</script>

<svg
  fill="currentColor"
  height={size}
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M10 1.75a8.25 8.25 0 1 1 0 16.5 8.25 8.25 0 0 1 0-16.5Zm3.337 4.72a.75.75 0 0 0-1.06 0L9.89 8.856 7.503 6.47a.75.75 0 0 0-1.06 1.06l2.386 2.387-2.387 2.387a.75.75 0 0 0 1.06 1.06l2.388-2.387 2.386 2.387a.75.75 0 0 0 1.06-1.06L10.95 9.917l2.387-2.387a.75.75 0 0 0 0-1.06Z"
  />
</svg>
