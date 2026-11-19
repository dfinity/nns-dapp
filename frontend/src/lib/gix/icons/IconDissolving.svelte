<!-- Source DFINITY Foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  fill="currentColor"
  height={size}
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    clip-rule="evenodd"
    d="M4 3.75C3.86193 3.75 3.75 3.86193 3.75 4V12C3.75 12.1381 3.86193 12.25 4 12.25H6C6.13807 12.25 6.25 12.1381 6.25 12V9.33333C6.25 8.91912 6.58579 8.58333 7 8.58333H8.6C8.73807 8.58333 8.85 8.4714 8.85 8.33333V7C8.85 6.58579 9.18579 6.25 9.6 6.25H12C12.1381 6.25 12.25 6.13807 12.25 6V4C12.25 3.86193 12.1381 3.75 12 3.75H4ZM2.25 4C2.25 3.0335 3.0335 2.25 4 2.25H12C12.9665 2.25 13.75 3.0335 13.75 4V6C13.75 6.9665 12.9665 7.75 12 7.75H10.35V8.33333C10.35 9.29983 9.5665 10.0833 8.6 10.0833H7.75V12C7.75 12.9665 6.9665 13.75 6 13.75H4C3.0335 13.75 2.25 12.9665 2.25 12V4Z"
    fill-rule="evenodd"
  />
  <path
    clip-rule="evenodd"
    d="M15 9C14.4477 9 14 9.44772 14 10V11C14 11.5523 14.4477 12 15 12H16C16.5523 12 17 11.5523 17 11V10C17 9.44772 16.5523 9 16 9H15Z"
    fill-rule="evenodd"
  />
  <path
    clip-rule="evenodd"
    d="M10 14C9.44772 14 9 14.4477 9 15V16C9 16.5523 9.44772 17 10 17H11C11.5523 17 12 16.5523 12 16V15C12 14.4477 11.5523 14 11 14H10Z"
    fill-rule="evenodd"
  />
  <path
    d="M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16Z"
  />
</svg>
