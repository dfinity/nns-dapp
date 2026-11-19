<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  data-tid="open-in-new"
  fill="none"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M16.875 7.8125V3.125H12.1875"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M11.25 8.75L16.875 3.125"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M14.375 11.25V16.25C14.375 16.4158 14.3092 16.5747 14.1919 16.6919C14.0747 16.8092 13.9158 16.875 13.75 16.875H3.75C3.58424 16.875 3.42527 16.8092 3.30806 16.6919C3.19085 16.5747 3.125 16.4158 3.125 16.25V6.25C3.125 6.08424 3.19085 5.92527 3.30806 5.80806C3.42527 5.69085 3.58424 5.625 3.75 5.625H8.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
