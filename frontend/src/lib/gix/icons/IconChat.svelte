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
>
  <path
    clip-rule="evenodd"
    d="M9.75 3.5C6.29822 3.5 3.5 6.29822 3.5 9.75C3.5 11.0719 3.90958 12.296 4.60874 13.305C4.83377 13.6297 4.8879 14.0631 4.7098 14.4463L3.98768 16H9.75C13.2018 16 16 13.2018 16 9.75C16 6.29822 13.2018 3.5 9.75 3.5ZM2 9.75C2 5.46979 5.46979 2 9.75 2C14.0302 2 17.5 5.46979 17.5 9.75C17.5 14.0302 14.0302 17.5 9.75 17.5H3.42013C2.55874 17.5 2.01392 16.5834 2.41248 15.8303L3.26528 13.9954C2.46533 12.7757 2 11.3162 2 9.75ZM7 11.75C7 11.3358 7.33579 11 7.75 11H11.75C12.1642 11 12.5 11.3358 12.5 11.75C12.5 12.1642 12.1642 12.5 11.75 12.5H7.75C7.33579 12.5 7 12.1642 7 11.75ZM7.75 7C7.33579 7 7 7.33579 7 7.75C7 8.16421 7.33579 8.5 7.75 8.5H8.75C9.16421 8.5 9.5 8.16421 9.5 7.75C9.5 7.33579 9.16421 7 8.75 7H7.75Z"
    fill="currentColor"
    fill-rule="evenodd"
  />
</svg>
