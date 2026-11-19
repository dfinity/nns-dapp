<!-- source: https://fonts.google.com/icons?selected=Material%20Icons%3Arocket_launch%3A -->
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
    d="M7.35156 14.543C6.46094 17.1914 2.92969 17.1914 2.92969 17.1914C2.92969 17.1914 2.92969 13.6602 5.57812 12.7695"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M15.3047 8.35547L10 13.6602L6.46094 10.1211L11.7656 4.81641C13.7734 2.80859 15.7813 2.83203 16.6406 2.95703C16.7732 2.97472 16.8963 3.03556 16.9909 3.13016C17.0855 3.22476 17.1464 3.34786 17.1641 3.48047C17.2891 4.33984 17.3125 6.34766 15.3047 8.35547Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M14.4219 9.23828V14.2852C14.4195 14.45 14.3521 14.6073 14.2344 14.7227L11.7109 17.2539C11.6309 17.3339 11.5306 17.3906 11.4208 17.418C11.3111 17.4455 11.1959 17.4426 11.0876 17.4097C10.9794 17.3769 10.882 17.3152 10.8061 17.2313C10.7301 17.1475 10.6783 17.0446 10.6562 16.9336L10 13.6602"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M10.8828 5.69922H5.83588C5.67102 5.70157 5.51377 5.76896 5.39838 5.88672L2.86713 8.41016C2.78716 8.49021 2.73043 8.59048 2.70299 8.70025C2.67554 8.81003 2.67842 8.9252 2.7113 9.03347C2.74418 9.14174 2.80584 9.23905 2.8897 9.31502C2.97355 9.39099 3.07646 9.44278 3.18744 9.46484L6.46088 10.1211"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M13.3334 6.78777H13.3417"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
  />
</svg>
