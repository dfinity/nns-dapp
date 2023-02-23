/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    syncSnsNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockReturnValue(undefined),
  };
});

jest.mock("$lib/services/sns-parameters.services", () => {
  return {
    loadSnsParameters: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/api/governance.api");

describe("Neurons", () => {
  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  beforeEach(() => {
    // Reset to default value
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Committed] })
    );
  });

  it("should render NnsNeurons by default", () => {
    const { queryByTestId } = render(Neurons);
    expect(queryByTestId("neurons-body")).toBeInTheDocument();
  });

  it("should render project page when a project is selected", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { queryByTestId } = render(Neurons);

    await waitFor(() =>
      expect(queryByTestId("sns-neurons-body")).toBeInTheDocument()
    );
  });
});
