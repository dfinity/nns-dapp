import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import {
  type ProjectDetailContext,
  type ProjectDetailStore,
  PROJECT_DETAIL_CONTEXT_KEY,
} from "../../lib/types/project-detail.context";
import type { SnsSummary, SnsSwapCommitment } from "../../lib/types/sns";
import ContextWrapperTest from "../lib/components/ContextWrapperTest.svelte";

export const renderContextCmp = ({
  Component,
  summary,
  swapCommitment,
}: {
  summary?: SnsSummary;
  swapCommitment?: SnsSwapCommitment;
  Component: typeof SvelteComponent;
}) =>
  render(ContextWrapperTest, {
    props: {
      contextKey: PROJECT_DETAIL_CONTEXT_KEY,
      contextValue: {
        store: writable<ProjectDetailStore>({
          summary,
          swapCommitment,
        }),
      } as ProjectDetailContext,
      Component,
    },
  });
