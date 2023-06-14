/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { mockAuthStoreNoIdentitySubscribe } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { SnsProposalDetailPo } from "$tests/page-objects/SnsProposalDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AnonymousIdentity } from "@dfinity/agent";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns-governance.api");

describe("SnsProposalDetail", () => {
  fakeSnsGovernanceApi.install();
  const proposalId = { id: BigInt(3) };
  const rootCanisterId = mockCanisterId;

  const renderComponent = async () => {
    const { container } = render(SnsProposalDetail, {
      props: {
        proposalIdText: proposalId.id.toString(),
      },
    });

    await runResolvedPromises();

    return SnsProposalDetailPo.under(new JestPageObjectElement(container));
  };

  describe("not logged in", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreNoIdentitySubscribe);
      page.mock({ data: { universe: rootCanisterId.toText() } });
    });

    it("should show skeleton while loading proposal", async () => {
      const proposalId = { id: BigInt(3) };
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });

      fakeSnsGovernanceApi.pause();
      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(await po.getSkeletonDetails().isPresent()).toBe(true);
    });

    it("should render content once proposal is loaded", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(await po.getSkeletonDetails().isPresent()).toBe(true);
      expect(await po.isContentLoaded()).toBe(false);

      fakeSnsGovernanceApi.resume();
      await waitFor(async () => expect(await po.isContentLoaded()).toBe(true));
      expect(await po.hasSummarySection()).toBe(true);
      expect(await po.hasSystemInfoSection()).toBe(true);
      expect(await po.getSkeletonDetails().isPresent()).toBe(false);
    });

    it("should update layout title text", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const spyOnSetTitle = jest.spyOn(layoutTitleStore, "set");
      const proposalIdText = proposalId.id.toString();
      render(SnsProposalDetail, {
        props: {
          proposalIdText,
        },
      });

      expect(spyOnSetTitle).toHaveBeenCalledTimes(1);
      expect(spyOnSetTitle).toHaveBeenCalledWith(`Proposal ${proposalIdText}`);
    });

    it("should render the name of the nervous function as title", async () => {
      const functionId = BigInt(12);
      const functionName = "test function";
      fakeSnsGovernanceApi.addNervousSystemFunctionWith({
        rootCanisterId,
        id: functionId,
        name: functionName,
      });
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
        action: functionId,
      });

      const po = await renderComponent();

      await waitFor(async () =>
        expect(await po.getSystemInfoSectionTitle()).toBe(functionName)
      );
    });

    it("should render the payload", async () => {
      const payload = "# Test payload";
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
        payload_text_rendering: [payload],
      });

      const po = await renderComponent();

      await waitFor(async () =>
        expect(await (await po.getPayloadText()).trim()).toBe(payload)
      );
    });

    it("should redirect to the list of sns proposals if proposal id is not a valid id", async () => {
      render(SnsProposalDetail, {
        props: {
          proposalIdText: "invalid",
        },
      });
      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Proposals);
      });
    });

    it("should redirect to the list of sns proposals if proposal is not found", async () => {
      // There is no proposal with id 2 in the fake implementation.
      // Therefore, the page should redirect to the list of proposals.
      render(SnsProposalDetail, {
        props: {
          proposalIdText: "2",
        },
      });
      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Proposals);
      });
    });

    it("should not render content if universe changes to Nns", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const { container, rerender } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(await po.getSkeletonDetails().isPresent()).toBe(true);
      expect(await po.isContentLoaded()).toBe(false);

      fakeSnsGovernanceApi.resume();
      await waitFor(async () => expect(await po.isContentLoaded()).toBe(true));

      page.mock({ data: { universe: OWN_CANISTER_ID.toText() } });

      rerender({
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });

      await waitFor(async () => expect(await po.isContentLoaded()).toBe(false));
    });
  });
});
