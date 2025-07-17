import * as favProjectsApi from "$lib/api/fav-projects.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { FavProject } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  addSnsFavProject,
  loadSnsFavProjects,
  removeSnsFavProject,
} from "$lib/services/sns.fav-projects.services";
import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import * as dfinityUtils from "@dfinity/utils";
import { get } from "svelte/store";

describe("sns-fav-projects-services", () => {
  const rootCanisterIdA = principal(1);
  const rootCanisterIdB = principal(2);
  const favProjectA: FavProject = {
    root_canister_id: rootCanisterIdA,
  };
  const favProjectB: FavProject = {
    root_canister_id: rootCanisterIdB,
  };
  const testError = new Error("test");

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
  });

  describe("loadSnsFavProjects", () => {
    it("should call getFavProjects and load favorite projects in store", async () => {
      const spyGetFavProjects = vi
        .spyOn(favProjectsApi, "getFavProjects")
        .mockResolvedValue({
          fav_projects: [favProjectA, favProjectB],
        });

      expect(spyGetFavProjects).toBeCalledTimes(0);

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: undefined,
        certified: undefined,
      });

      await loadSnsFavProjects();

      expect(spyGetFavProjects).toBeCalledTimes(2);
      expect(spyGetFavProjects).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
      });
      expect(spyGetFavProjects).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [rootCanisterIdA, rootCanisterIdB],
        certified: true,
      });
    });

    it("should not display toast on error", async () => {
      vi.spyOn(console, "error").mockReturnValue();

      const spyGetFavProjects = vi
        .spyOn(favProjectsApi, "getFavProjects")
        .mockRejectedValue(testError);

      expect(spyGetFavProjects).toBeCalledTimes(0);
      expect(get(toastsStore)).toEqual([]);

      await loadSnsFavProjects();

      expect(get(toastsStore)).toEqual([]);
      // Should not display toast - it's logged to console only
      expect(spyGetFavProjects).toBeCalledTimes(2);
    });

    it("should reset store on error", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      vi.spyOn(favProjectsApi, "getFavProjects").mockRejectedValue(testError);

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      await loadSnsFavProjects();

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: undefined,
        certified: undefined,
      });
    });

    it("should handle AccountNotFoundError (no error, empty favorite projects)", async () => {
      const accountNotFoundError = new AccountNotFoundError("test");
      vi.spyOn(favProjectsApi, "getFavProjects").mockRejectedValue(
        accountNotFoundError
      );
      vi.spyOn(console, "error").mockReturnValue();

      expect(get(toastsStore)).toEqual([]);
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: undefined,
        certified: undefined,
      });

      await loadSnsFavProjects();

      expect(get(toastsStore)).toEqual([]);
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [],
        certified: true,
      });
    });
  });

  describe("addSnsFavProject", () => {
    it("should call setFavProjects with updated project list", async () => {
      const spySetFavProjects = vi
        .spyOn(favProjectsApi, "setFavProjects")
        .mockResolvedValue(undefined);
      const spyGetFavProjects = vi
        .spyOn(favProjectsApi, "getFavProjects")
        .mockResolvedValue({
          fav_projects: [favProjectA, favProjectB],
        });

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      expect(spySetFavProjects).toBeCalledTimes(0);

      const { success } = await addSnsFavProject(principal(2));

      expect(success).toEqual(true);
      expect(spySetFavProjects).toBeCalledTimes(1);
      expect(spySetFavProjects).toBeCalledWith({
        identity: mockIdentity,
        favProjects: [favProjectA, favProjectB],
      });
      // Should reload projects
      expect(spyGetFavProjects).toBeCalledTimes(2);
    });

    it("should display busy store", async () => {
      let resolveSetFavProjects;
      const spyOnSetFavProjects = vi
        .spyOn(favProjectsApi, "setFavProjects")
        .mockImplementation(
          () =>
            new Promise<void>((resolve) => (resolveSetFavProjects = resolve))
        );
      vi.spyOn(favProjectsApi, "getFavProjects").mockResolvedValue({
        fav_projects: [favProjectA, favProjectB],
      });

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      expect(spyOnSetFavProjects).toBeCalledTimes(0);
      expect(get(busyStore)).toEqual([]);

      addSnsFavProject(rootCanisterIdB);
      await runResolvedPromises();

      expect(spyOnSetFavProjects).toBeCalledTimes(1);
      expect(get(busyStore)).toEqual([
        {
          initiator: "fav-project-adding",
          text: "Adding project to favorites",
        },
      ]);

      resolveSetFavProjects();
      await runResolvedPromises();

      expect(get(busyStore)).toEqual([]);
    });

    it("should display toast on error", async () => {
      vi.spyOn(favProjectsApi, "setFavProjects").mockRejectedValue(testError);

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA],
        certified: true,
      });

      expect(get(toastsStore)).toEqual([]);

      const { success } = await addSnsFavProject(rootCanisterIdB);

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an error while adding the project to favorites.",
        },
      ]);
    });
  });

  describe("removeSnsFavProject", () => {
    it("should call setFavProjects with updated project list", async () => {
      const spyGetFavProjects = vi
        .spyOn(favProjectsApi, "getFavProjects")
        .mockResolvedValue({
          fav_projects: [favProjectA, favProjectB],
        });
      const spySetFavProjects = vi
        .spyOn(favProjectsApi, "setFavProjects")
        .mockResolvedValue(undefined);

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA, rootCanisterIdB],
        certified: true,
      });

      expect(spySetFavProjects).toBeCalledTimes(0);

      const { success } = await removeSnsFavProject(rootCanisterIdA);

      expect(success).toEqual(true);
      expect(spySetFavProjects).toBeCalledTimes(1);
      expect(spySetFavProjects).toBeCalledWith({
        identity: mockIdentity,
        favProjects: [favProjectB],
      });

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [rootCanisterIdB],
        certified: true,
      });
      // Should not reload projects
      expect(spyGetFavProjects).toBeCalledTimes(0);
    });

    it("should display busy store", async () => {
      let resolveSetFavProjects;
      const spyOnSetFavProjects = vi
        .spyOn(favProjectsApi, "setFavProjects")
        .mockImplementation(
          () =>
            new Promise<void>((resolve) => (resolveSetFavProjects = resolve))
        );

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA, rootCanisterIdB],
        certified: true,
      });

      expect(spyOnSetFavProjects).toBeCalledTimes(0);
      expect(get(busyStore)).toEqual([]);

      removeSnsFavProject(rootCanisterIdA);
      await runResolvedPromises();

      expect(spyOnSetFavProjects).toBeCalledTimes(1);
      expect(get(busyStore)).toEqual([
        {
          initiator: "fav-project-removing",
          text: "Removing project from favorites",
        },
      ]);

      resolveSetFavProjects();
      await runResolvedPromises();

      expect(get(busyStore)).toEqual([]);
    });

    it("should display toast on error", async () => {
      vi.spyOn(favProjectsApi, "setFavProjects").mockRejectedValue(testError);

      snsFavProjectsStore.set({
        rootCanisterIds: [rootCanisterIdA, rootCanisterIdB],
        certified: true,
      });

      expect(get(toastsStore)).toEqual([]);

      const { success } = await removeSnsFavProject(rootCanisterIdA);

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an error while removing the project from favorites.",
        },
      ]);
    });
  });
});
