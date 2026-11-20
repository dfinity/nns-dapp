<!-- source: DFINITY foundation -->
<script lang="ts">
  interface Props {
    size?: string | number;
  }

  const DEFAULT_SIZE = 40;

  let { size = `${DEFAULT_SIZE}px` }: Props = $props();
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
    d="M7.35156 14.4219C6.46094 17.0703 2.92969 17.0703 2.92969 17.0703C2.92969 17.0703 2.92969 13.5391 5.57812 12.6484"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M15.3047 8.23447L10 13.5392L6.46094 10.0001L11.7656 4.6954C13.7734 2.68759 15.7813 2.71103 16.6406 2.83603C16.7732 2.85372 16.8963 2.91456 16.9909 3.00916C17.0855 3.10376 17.1464 3.22686 17.1641 3.35947C17.2891 4.21884 17.3125 6.22665 15.3047 8.23447Z"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M14.4219 9.11719V14.1641C14.4195 14.3289 14.3521 14.4862 14.2344 14.6016L11.7109 17.1328C11.6309 17.2128 11.5306 17.2695 11.4208 17.297C11.3111 17.3244 11.1959 17.3215 11.0876 17.2886C10.9794 17.2558 10.882 17.1941 10.8061 17.1102C10.7301 17.0264 10.6783 16.9235 10.6562 16.8125L10 13.5391"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M10.8828 5.57812H5.83588C5.67102 5.58047 5.51377 5.64787 5.39838 5.76563L2.86713 8.28906C2.78716 8.36912 2.73043 8.46939 2.70299 8.57916C2.67554 8.68894 2.67842 8.8041 2.7113 8.91237C2.74418 9.02064 2.80584 9.11796 2.8897 9.19393C2.97355 9.2699 3.07646 9.32168 3.18744 9.34375L6.46088 10"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M13.3333 6.66675H13.3416"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
  />
</svg>
