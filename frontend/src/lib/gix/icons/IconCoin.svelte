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
  viewBox="0 0 16 16"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M8 9.5C11.5899 9.5 14.5 8.15685 14.5 6.5C14.5 4.84315 11.5899 3.5 8 3.5C4.41015 3.5 1.5 4.84315 1.5 6.5C1.5 8.15685 4.41015 9.5 8 9.5Z"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.2"
  />
  <path
    d="M8 9.5V12.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.2"
  />
  <path
    d="M1.5 6.5V9.5C1.5 11 4 12.5 8 12.5C12 12.5 14.5 11 14.5 9.5V6.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.2"
  />
  <path
    d="M12 8.88086V11.8809"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.2"
  />
  <path
    d="M4 8.88086V11.8809"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.2"
  />
</svg>
