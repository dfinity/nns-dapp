let
  # flutter 2.0.3 is only available in unstable
  pkgs_unstable = import (fetchTarball ("channel:nixpkgs-unstable")) { };

  # dfinity specific pkgs
  common =
    builtins.fetchGit { url = "ssh://git@github.com/dfinity-lab/common"; };
  pkgs = import (common + "/pkgs") { repoRoot = ./.; };
in with pkgs;
mkShell {
  buildInputs = [
    nodejs
    nodePackages.typescript
    nodePackages.browserify
    pkgs_unstable.flutter
    binaryen
    cargo
    rustc
    openssl
    pkg-config
  ];
  CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_LINKER = "${llvmPackages_9.lld}/bin/lld";
}
