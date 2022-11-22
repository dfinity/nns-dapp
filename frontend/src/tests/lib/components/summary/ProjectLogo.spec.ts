/**
 * @jest-environment jsdom
 */

import {committedProjectsStore} from "$lib/stores/projects.store";
import {mockProjectSubscribe, mockSnsFullProject} from "../../../mocks/sns-projects.mock";
import {page} from "$mocks/$app/stores";
import {OWN_CANISTER_ID_TEXT} from "$lib/constants/canister-ids.constants";
import {render} from "@testing-library/svelte";
import ProjectLogo from "$lib/components/summary/ProjectLogo.svelte";
import {IC_LOGO} from "$lib/constants/icp.constants";
import {mockSnsCanisterIdText} from "../../../mocks/sns.api.mock";
import {snsProjectSelectedStore} from "$lib/derived/selected-project.derived";
import {mockStoreSubscribe} from "../../../mocks/commont.mock";

describe("ProjectLogo", () => {
    describe("nns", () => {
        beforeEach(() => page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } }));

        it("should render ic logo", () => {
            const { getByTestId } = render(ProjectLogo);

            expect(getByTestId("logo")?.getAttribute("src")).toEqual(IC_LOGO)
        });
    })

    describe("sns", () => {
        beforeAll(() => jest
            .spyOn(snsProjectSelectedStore, "subscribe")
            .mockImplementation(mockStoreSubscribe(mockSnsFullProject)))

        beforeEach(() => page.mock({ data: { universe: mockSnsCanisterIdText } }));

        it("should render project logo", () => {
            const { getByTestId } = render(ProjectLogo);

            expect(getByTestId("logo")?.getAttribute("src")).toEqual(mockSnsFullProject.summary.metadata.logo)
        });
    });

});