<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
  ><path
    d="m15.71 9.945 1.79 3.086M12.047 11.664l.555 3.149M7.945 11.656l-.554 3.156M4.281 9.945l-1.789 3.102M2.5 8.195c1.313 1.625 3.719 3.68 7.5 3.68s6.188-2.055 7.5-3.68"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  /></svg
>
