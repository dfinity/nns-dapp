<!-- source: DFINITY foundation -->
<script lang="ts">
  interface Props {
    size?: string | number;
  }

  // Default to 100% size to make sure Safari renders the SVG correctly
  let { size = "100%" }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  viewBox="0 0 144 144"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    fill="#436FF5"
    height="102.635"
    opacity="0.2"
    rx="18.0601"
    transform="rotate(7 40.3359 10.2273)"
    width="102.635"
    x="40.3359"
    y="10.2273"
  />
  <path
    clip-rule="evenodd"
    d="M39.5626 33.9095C29.4926 36.6077 23.4254 46.6183 26.0113 56.2688L27.6108 62.2384C28.4728 65.4552 26.4504 68.792 23.0937 69.6915C19.737 70.5909 16.3172 68.7123 15.4552 65.4954L13.8557 59.5259C9.54596 43.4418 19.6579 26.7575 36.4413 22.2604C53.2246 17.7633 70.324 27.1564 74.6337 43.2404L76.2332 49.21C77.0952 52.4268 75.0728 55.7637 71.7161 56.6631C68.3594 57.5625 64.9396 55.6839 64.0776 52.4671L62.4781 46.4975C59.8923 36.8471 49.6327 31.2112 39.5626 33.9095Z"
    fill="url(#paint0_linear_2_6655)"
    fill-rule="evenodd"
  />
  <rect
    fill="url(#paint1_linear_2_6655)"
    height="69.2142"
    rx="16"
    transform="rotate(-15 4.78418 68.6381)"
    width="88.0908"
    x="4.78418"
    y="68.6381"
  />
  <rect
    fill="url(#paint2_linear_2_6655)"
    height="25.1688"
    rx="12.5844"
    transform="rotate(75 63.5562 69.1753)"
    width="37.7532"
    x="63.5562"
    y="69.1753"
  />
  <defs>
    <linearGradient
      id="paint0_linear_2_6655"
      gradientUnits="userSpaceOnUse"
      x1="1.56057"
      x2="76.0457"
      y1="13.6399"
      y2="22.4978"
    >
      <stop stop-color="#C4D3FF" />
      <stop offset="1" stop-color="#003FFF" />
    </linearGradient>
    <linearGradient
      id="paint1_linear_2_6655"
      gradientUnits="userSpaceOnUse"
      x1="4.78418"
      x2="106.006"
      y1="40.2819"
      y2="74.9393"
    >
      <stop stop-color="#C4D3FF" />
      <stop offset="1" stop-color="#003FFF" />
    </linearGradient>
    <linearGradient
      id="paint2_linear_2_6655"
      gradientUnits="userSpaceOnUse"
      x1="93.5454"
      x2="97.7459"
      y1="69.1574"
      y2="100.921"
    >
      <stop stop-color="#F9FFFC" />
      <stop offset="1" stop-color="#F7FBFF" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>
