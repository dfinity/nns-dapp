// vitest.config.ts
import { sveltekit } from "file:///Users/llorencmuntaner/Documents/nns-dapp/frontend/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { resolve } from "path";
import { configDefaults, defineConfig } from "file:///Users/llorencmuntaner/Documents/nns-dapp/frontend/node_modules/vitest/dist/config.js";
var __vite_injected_original_dirname = "/Users/llorencmuntaner/Documents/nns-dapp/frontend";
var vitest_config_default = defineConfig(
  ({ mode }) => ({
    plugins: [sveltekit()],
    resolve: {
      alias: [
        {
          find: "$lib",
          replacement: resolve(__vite_injected_original_dirname, "src/lib")
        },
        {
          find: "$routes",
          replacement: resolve(__vite_injected_original_dirname, "src/routes")
        },
        {
          find: "$tests",
          replacement: resolve(__vite_injected_original_dirname, "src/tests")
        },
        {
          find: "$mocks",
          replacement: resolve(__vite_injected_original_dirname, "__mocks__")
        },
        {
          find: "@dfinity/gix-components",
          replacement: resolve(
            __vite_injected_original_dirname,
            "node_modules/@dfinity/gix-components"
          )
        },
        // vitest issue https://github.com/vitest-dev/vitest/issues/2834#issuecomment-1425371719
        {
          find: /svelte\/ssr.mjs/,
          replacement: "svelte/index.mjs"
        }
      ]
    },
    test: {
      environment: "jsdom",
      environmentOptions: {
        jsdom: {
          url: "https://nns.internetcomputer.org/"
        }
      },
      exclude: [
        ...configDefaults.exclude,
        ...mode === "test" ? ["./src/tests/e2e/**/*"] : []
      ],
      include: [
        ...mode === "e2e" ? ["./src/tests/e2e/**/*"] : ["./src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"]
      ],
      globals: true,
      watch: false,
      setupFiles: ["./vitest.setup.ts"],
      deps: {
        optimizer: {
          ssr: {
            include: ["@dfinity/gix-components"]
          }
        }
      },
      // Vitest issue: https://github.com/vitest-dev/vitest/issues/2834#issuecomment-1439576110
      alias: [{ find: /^svelte$/, replacement: "svelte/internal" }],
      reporters: ["basic", "hanging-process"],
      sequence: {
        hooks: "list"
      },
      // Vitest: https://github.com/vitest-dev/vitest/issues/2008#issuecomment-1436415644
      // Some threads remain open when we run the test suite locally or in the CI, which causes vitest to hang forever.
      // Following stacktrace can for example finds place:
      //
      // > # FILEHANDLE
      // > node:internal/async_hooks:202
      // > close timed out after 30000ms
      // > Failed to terminate worker while running /nns-dapp/frontend/src/tests/lib/components/project-detail/ProjectCommitment.spec.ts.
      // > Tests closed successfully but something prevents Vite server from exiting
      // > You can try to identify the cause by enabling "hanging-process" reporter. See https://vitest.dev/config/#reporters
      //
      // Use atomics to synchronize threads seem to resolve the issue according our tests.
      // https://vitest.dev/config/#pooloptions-threads-useatomics
      useAtomics: true
    }
  })
);
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9sbG9yZW5jbXVudGFuZXIvRG9jdW1lbnRzL25ucy1kYXBwL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbGxvcmVuY211bnRhbmVyL0RvY3VtZW50cy9ubnMtZGFwcC9mcm9udGVuZC92aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9sbG9yZW5jbXVudGFuZXIvRG9jdW1lbnRzL25ucy1kYXBwL2Zyb250ZW5kL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tIFwiQHN2ZWx0ZWpzL2tpdC92aXRlXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBjb25maWdEZWZhdWx0cywgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKFxuICAoeyBtb2RlIH06IFVzZXJDb25maWcpOiBVc2VyQ29uZmlnID0+ICh7XG4gICAgcGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW1xuICAgICAgICB7XG4gICAgICAgICAgZmluZDogXCIkbGliXCIsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9saWJcIiksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBmaW5kOiBcIiRyb3V0ZXNcIixcbiAgICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL3JvdXRlc1wiKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6IFwiJHRlc3RzXCIsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy90ZXN0c1wiKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6IFwiJG1vY2tzXCIsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoX19kaXJuYW1lLCBcIl9fbW9ja3NfX1wiKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6IFwiQGRmaW5pdHkvZ2l4LWNvbXBvbmVudHNcIixcbiAgICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShcbiAgICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzL0BkZmluaXR5L2dpeC1jb21wb25lbnRzXCJcbiAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgICAgICAvLyB2aXRlc3QgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVzdC1kZXYvdml0ZXN0L2lzc3Vlcy8yODM0I2lzc3VlY29tbWVudC0xNDI1MzcxNzE5XG4gICAgICAgIHtcbiAgICAgICAgICBmaW5kOiAvc3ZlbHRlXFwvc3NyLm1qcy8sXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IFwic3ZlbHRlL2luZGV4Lm1qc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHRlc3Q6IHtcbiAgICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgICBlbnZpcm9ubWVudE9wdGlvbnM6IHtcbiAgICAgICAganNkb206IHtcbiAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ubnMuaW50ZXJuZXRjb21wdXRlci5vcmcvXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgZXhjbHVkZTogW1xuICAgICAgICAuLi5jb25maWdEZWZhdWx0cy5leGNsdWRlLFxuICAgICAgICAuLi4obW9kZSA9PT0gXCJ0ZXN0XCIgPyBbXCIuL3NyYy90ZXN0cy9lMmUvKiovKlwiXSA6IFtdKSxcbiAgICAgIF0sXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC4uLihtb2RlID09PSBcImUyZVwiXG4gICAgICAgICAgPyBbXCIuL3NyYy90ZXN0cy9lMmUvKiovKlwiXVxuICAgICAgICAgIDogW1wiLi9zcmMvdGVzdHMvKiovKi57dGVzdCxzcGVjfS4/KGN8bSlbanRdcz8oeClcIl0pLFxuICAgICAgXSxcbiAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgICB3YXRjaDogZmFsc2UsXG4gICAgICBzZXR1cEZpbGVzOiBbXCIuL3ZpdGVzdC5zZXR1cC50c1wiXSxcbiAgICAgIGRlcHM6IHtcbiAgICAgICAgb3B0aW1pemVyOiB7XG4gICAgICAgICAgc3NyOiB7XG4gICAgICAgICAgICBpbmNsdWRlOiBbXCJAZGZpbml0eS9naXgtY29tcG9uZW50c1wiXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFZpdGVzdCBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVzdC1kZXYvdml0ZXN0L2lzc3Vlcy8yODM0I2lzc3VlY29tbWVudC0xNDM5NTc2MTEwXG4gICAgICBhbGlhczogW3sgZmluZDogL15zdmVsdGUkLywgcmVwbGFjZW1lbnQ6IFwic3ZlbHRlL2ludGVybmFsXCIgfV0sXG4gICAgICByZXBvcnRlcnM6IFtcImJhc2ljXCIsIFwiaGFuZ2luZy1wcm9jZXNzXCJdLFxuICAgICAgc2VxdWVuY2U6IHtcbiAgICAgICAgaG9va3M6IFwibGlzdFwiLFxuICAgICAgfSxcbiAgICAgIC8vIFZpdGVzdDogaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVzdC1kZXYvdml0ZXN0L2lzc3Vlcy8yMDA4I2lzc3VlY29tbWVudC0xNDM2NDE1NjQ0XG4gICAgICAvLyBTb21lIHRocmVhZHMgcmVtYWluIG9wZW4gd2hlbiB3ZSBydW4gdGhlIHRlc3Qgc3VpdGUgbG9jYWxseSBvciBpbiB0aGUgQ0ksIHdoaWNoIGNhdXNlcyB2aXRlc3QgdG8gaGFuZyBmb3JldmVyLlxuICAgICAgLy8gRm9sbG93aW5nIHN0YWNrdHJhY2UgY2FuIGZvciBleGFtcGxlIGZpbmRzIHBsYWNlOlxuICAgICAgLy9cbiAgICAgIC8vID4gIyBGSUxFSEFORExFXG4gICAgICAvLyA+IG5vZGU6aW50ZXJuYWwvYXN5bmNfaG9va3M6MjAyXG4gICAgICAvLyA+IGNsb3NlIHRpbWVkIG91dCBhZnRlciAzMDAwMG1zXG4gICAgICAvLyA+IEZhaWxlZCB0byB0ZXJtaW5hdGUgd29ya2VyIHdoaWxlIHJ1bm5pbmcgL25ucy1kYXBwL2Zyb250ZW5kL3NyYy90ZXN0cy9saWIvY29tcG9uZW50cy9wcm9qZWN0LWRldGFpbC9Qcm9qZWN0Q29tbWl0bWVudC5zcGVjLnRzLlxuICAgICAgLy8gPiBUZXN0cyBjbG9zZWQgc3VjY2Vzc2Z1bGx5IGJ1dCBzb21ldGhpbmcgcHJldmVudHMgVml0ZSBzZXJ2ZXIgZnJvbSBleGl0aW5nXG4gICAgICAvLyA+IFlvdSBjYW4gdHJ5IHRvIGlkZW50aWZ5IHRoZSBjYXVzZSBieSBlbmFibGluZyBcImhhbmdpbmctcHJvY2Vzc1wiIHJlcG9ydGVyLiBTZWUgaHR0cHM6Ly92aXRlc3QuZGV2L2NvbmZpZy8jcmVwb3J0ZXJzXG4gICAgICAvL1xuICAgICAgLy8gVXNlIGF0b21pY3MgdG8gc3luY2hyb25pemUgdGhyZWFkcyBzZWVtIHRvIHJlc29sdmUgdGhlIGlzc3VlIGFjY29yZGluZyBvdXIgdGVzdHMuXG4gICAgICAvLyBodHRwczovL3ZpdGVzdC5kZXYvY29uZmlnLyNwb29sb3B0aW9ucy10aHJlYWRzLXVzZWF0b21pY3NcbiAgICAgIHVzZUF0b21pY3M6IHRydWUsXG4gICAgfSxcbiAgfSlcbik7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRVLFNBQVMsaUJBQWlCO0FBQ3RXLFNBQVMsZUFBZTtBQUV4QixTQUFTLGdCQUFnQixvQkFBb0I7QUFIN0MsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyx3QkFBUTtBQUFBLEVBQ2IsQ0FBQyxFQUFFLEtBQUssT0FBK0I7QUFBQSxJQUNyQyxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsSUFDckIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVyxTQUFTO0FBQUEsUUFDM0M7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQzlDO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxRQUM3QztBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDN0M7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYTtBQUFBLFFBQ2Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osYUFBYTtBQUFBLE1BQ2Isb0JBQW9CO0FBQUEsUUFDbEIsT0FBTztBQUFBLFVBQ0wsS0FBSztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxHQUFHLGVBQWU7QUFBQSxRQUNsQixHQUFJLFNBQVMsU0FBUyxDQUFDLHNCQUFzQixJQUFJLENBQUM7QUFBQSxNQUNwRDtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsR0FBSSxTQUFTLFFBQ1QsQ0FBQyxzQkFBc0IsSUFDdkIsQ0FBQyw4Q0FBOEM7QUFBQSxNQUNyRDtBQUFBLE1BQ0EsU0FBUztBQUFBLE1BQ1QsT0FBTztBQUFBLE1BQ1AsWUFBWSxDQUFDLG1CQUFtQjtBQUFBLE1BQ2hDLE1BQU07QUFBQSxRQUNKLFdBQVc7QUFBQSxVQUNULEtBQUs7QUFBQSxZQUNILFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxVQUNyQztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLE9BQU8sQ0FBQyxFQUFFLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixDQUFDO0FBQUEsTUFDNUQsV0FBVyxDQUFDLFNBQVMsaUJBQWlCO0FBQUEsTUFDdEMsVUFBVTtBQUFBLFFBQ1IsT0FBTztBQUFBLE1BQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BY0EsWUFBWTtBQUFBLElBQ2Q7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
