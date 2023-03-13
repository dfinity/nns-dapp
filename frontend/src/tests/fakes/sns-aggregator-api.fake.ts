import type { CachedSns } from "$lib/api/sns-aggregator.api";
import { aggregatorSnsMockWith } from "$tests/mocks/sns-aggregator.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import type { SnsSwapLifecycle } from "@dfinity/sns";

const modulePath = "$lib/api/sns-aggregator.api";
const implementedFunctions = {
  querySnsProjects,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

const projects: CachedSns[] = [];

////////////////////////
// Fake implementations:
////////////////////////

async function querySnsProjects(): Promise<CachedSns[]> {
  return projects;
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  projects.length = 0;
};

export const addProjectWith = ({
  rootCanisterId,
  lifecycle,
}: {
  rootCanisterId: string;
  lifecycle: SnsSwapLifecycle;
}): CachedSns => {
  const project = aggregatorSnsMockWith({ rootCanisterId, lifecycle });
  projects.push(project);
  return project;
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const install = () => {
  beforeEach(() => {
    reset();
  });
  installImplAndBlockRest({
    modulePath,
    implementedFunctions,
  });
};
