<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = DEFAULT_ICON_SIZE }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M13.438 8.125 8.851 12.5l-2.29-2.188"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  /><path
    d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  /></svg
>
