<script lang="ts">
  import { loadSnsFullProjects } from "../../services/sns.services";
  import { SnsProjectStatus } from "../../services/sns.mock";
  import { i18n } from "../../stores/i18n";
  import {
    snsFullProjectStore,
    type SnsFullProject,
  } from "../../stores/snsProjects.store";
  import SnsProjectList from "./SNSProjectList.svelte";

  let loading: boolean = false;
  let opportunityProjects: SnsFullProject[] | undefined;
  let upcomingProjects: SnsFullProject[] | undefined;
  $: opportunityProjects = $snsFullProjectStore?.filter(
    ({ summary: { status } }) => status === SnsProjectStatus.Opportunity
  );
  $: upcomingProjects = $snsFullProjectStore?.filter(
    ({ summary: { status } }) => status === SnsProjectStatus.Upcoming
  );

  const load = async () => {
    // show loading state only when store is empty
    loading = $snsFullProjectStore === undefined;

    await loadSnsFullProjects();
    loading = false;
  };

  load();
</script>

<SnsProjectList
  projects={opportunityProjects}
  title={$i18n.sns_launchpad.opportunity_projects}
  {loading}
/>

<SnsProjectList
  projects={upcomingProjects}
  title={$i18n.sns_launchpad.upcoming_projects}
  {loading}
/>
