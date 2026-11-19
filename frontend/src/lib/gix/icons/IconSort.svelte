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
  stroke="currentColor"
  stroke-linecap="round"
  stroke-width="1.5"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M3.33301 14.166H9.33301" />
  <path d="M3.3335 10L9.3335 10" />
  <path d="M3.33301 5.83398L9.33301 5.83398" />
  <path
    d="M14.167 3.66602L14.167 16.666M14.167 3.66602L11.667 6.91602M14.167 3.66602L16.667 6.91602M14.167 16.666L16.667 13.416M14.167 16.666L11.667 13.416"
    stroke-linejoin="round"
  />
</svg>
