<!-- Source DFINITY Foundation -->
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
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M12.5 13.9596L12.5 13.9999C12.5 14.9333 12.5 15.4004 12.3183 15.7569C12.1586 16.0705 11.9038 16.3253 11.5902 16.4851C11.2336 16.6667 10.7666 16.6667 9.83317 16.6667L5.99984 16.6667C5.06642 16.6667 4.60036 16.6667 4.24384 16.4851C3.93023 16.3253 3.6746 16.0705 3.51481 15.7569C3.33333 15.4007 3.33333 14.9343 3.33333 14.0027L3.33333 5.9971C3.33333 5.0655 3.33333 4.59968 3.51481 4.24351C3.6746 3.92991 3.93024 3.67468 4.24384 3.51489C4.60001 3.33342 5.06583 3.33342 5.99743 3.33342L9.83591 3.33342C10.7675 3.33342 11.234 3.33342 11.5902 3.51489C11.9038 3.67468 12.1586 3.93015 12.3183 4.24376C12.5 4.60028 12.5 5.06666 12.5 6.00008L12.5 6.04175"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M14.5832 12.5L17.0832 10M17.0832 10L14.5832 7.5M17.0832 10H7.9165"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
