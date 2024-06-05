<script>
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import { fade } from "svelte/transition";
</script>

<div class="card-grid" data-tid="proposals-loading" in:fade|global>
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
</div>
