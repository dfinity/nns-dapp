# Use this with:
#
# docker build . -t nns-dapp
# container_id=$(docker create nns-dapp no-op)
# docker cp $container_id:nns-dapp.wasm.gz nns-dapp.wasm.gz
# docker rm --volumes $container_id

# Check the memory available to docker.
# - If run on Linux, the RAM will be the same as the host machine.
# - If run on Mac, Docker will be spinning up a Linux virtual machine and then running docker inside that; the user can change the memory available to the virtual machine.
FROM --platform=linux/amd64 ubuntu:20.04 as check-environment
SHELL ["bash", "-c"]
ENV TZ=UTC
RUN awk -v gigs=4 '/^MemTotal:/{if ($2 < (gigs*1024 * 1024)){ printf "Insufficient RAM.  Please provide Docker with at least %dGB of RAM\n", gigs; exit 1 }}' /proc/meminfo

# Operating system with basic tools
FROM --platform=linux/amd64 ubuntu:20.04 as base
SHELL ["bash", "-c"]
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
        build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake \
        git jq npm xxd file

# Gets tool versions.
#
# Note: This can be done in the builder but is slow because unrelated changes to dfx.json can cause a rebuild.
#
# Note: Here we play a bit with the idea of storing config in files, one file per parameter.
FROM base as tool_versions
SHELL ["bash", "-c"]
RUN mkdir -p config
COPY dfx.json dfx.json
ENV NODE_VERSION=16.17.1
RUN jq -r .dfx dfx.json > config/dfx_version
RUN jq -r '.defaults.build.config.NODE_VERSION' dfx.json > config/node_version
RUN jq -r '.defaults.build.config.DIDC_RELEASE' dfx.json > config/didc_version
RUN jq -r '.defaults.build.config.OPTIMIZER_VERSION' dfx.json > config/optimizer_version
RUN jq -r '.defaults.build.config.IC_WASM_VERSION' dfx.json > config/ic_wasm_version
RUN jq -r '.defaults.build.config.BINSTALL_VERSION' dfx.json > config/binstall_version

# This is the "builder", i.e. the base image used later to build the final code.
FROM base as builder
SHELL ["bash", "-c"]
# Get tool versions
COPY --from=tool_versions /config/*_version config/
# Install node
RUN npm install -g n
RUN n "$(cat config/node_version)"
RUN node --version
RUN npm --version
# Install Rust and Cargo in /opt
COPY rust-toolchain.toml .
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH
RUN curl --fail https://sh.rustup.rs -sSf \
        | sh -s -- -y --no-modify-path
ENV PATH=/cargo/bin:$PATH
RUN cargo --version
# Pre-build all cargo dependencies. Because cargo doesn't have a build option
# to build only the dependencies, we pretend that our project is a simple, empty
# `lib.rs`. Then we remove the dummy source files to make sure cargo rebuild
# everything once the actual source code is COPYed (and e.g. doesn't trip on
# timestamps being older)
WORKDIR /build
COPY rust-toolchain.toml .
COPY Cargo.lock .
COPY Cargo.toml .
COPY rs/backend/Cargo.toml rs/backend/Cargo.toml
COPY rs/proposals/Cargo.toml rs/proposals/Cargo.toml
COPY rs/sns_aggregator/Cargo.toml rs/sns_aggregator/Cargo.toml
RUN mkdir -p rs/backend/src/bin rs/proposals/src rs/sns_aggregator/src && touch rs/backend/src/lib.rs rs/proposals/src/lib.rs rs/sns_aggregator/src/lib.rs && echo 'fn main(){}' | tee rs/backend/src/main.rs > rs/backend/src/bin/nns-dapp-check-args.rs && cargo build --target wasm32-unknown-unknown --release --package nns-dapp && rm -f target/wasm32-unknown-unknown/release/*wasm
# Install dfx
WORKDIR /
# dfx is installed in `$HOME/.local/share/dfx/bin` but we can't reference `$HOME` here so we hardcode `/root`.
ENV PATH="/root/.local/share/dfx/bin:${PATH}"
RUN DFXVM_INIT_YES=true DFX_VERSION="$(cat config/dfx_version)" sh -c "$(curl -fsSL https://sdk.dfinity.org/install.sh)" && dfx --version
# TODO: Make didc support binstall, then use cargo binstall --no-confirm didc here.
RUN set +x && curl -Lf --retry 5 "https://github.com/dfinity/candid/releases/download/$(cat config/didc_version)/didc-linux64" | install -m 755 /dev/stdin "/usr/local/bin/didc" && didc --version
RUN curl -L --proto '=https' --tlsv1.2 -sSf "https://github.com/cargo-bins/cargo-binstall/releases/download/v$(cat config/binstall_version)/cargo-binstall-x86_64-unknown-linux-musl.tgz" | tar -xvzf -
RUN ./cargo-binstall -y --force "cargo-binstall@$(cat config/binstall_version)"
RUN cargo binstall --no-confirm "ic-wasm@$(cat config/ic_wasm_version)" && command -v ic-wasm

# Title: Gets the deployment configuration
# Args: Everything in the environment.  Ideally also ~/.config/dfx but that is inaccessible.
# Note: This MUST NOT be used as an input for the frontend or wasm.
FROM builder AS configurator
SHELL ["bash", "-c"]
COPY dfx.json config.sh canister_ids.jso[n] /build/
COPY global-config.json /root/.config/dfx/networks.json
COPY scripts/network-config /build/scripts/network-config
COPY scripts/dfx-canister-url /build/scripts/dfx-canister-url
COPY scripts/clap.bash /build/scripts/clap.bash
COPY .df[x]/ /build/.dfx
WORKDIR /build
ARG DFX_NETWORK=mainnet
RUN mkdir -p frontend
RUN ./config.sh
RUN didc encode "$(cat nns-dapp-arg-${DFX_NETWORK}.did)" | xxd -r -p >nns-dapp-arg-${DFX_NETWORK}.bin

# Title: Gets the mainnet config, used for builds
# Args: None.  This is fixed and studiously avoids depending on variables such as DFX_NETWORK.
# Note: This MUST NOT be used as an input for the frontend or wasm.
#       The mainnet config is compiled in and may be overridden using deploy args.
FROM builder AS mainnet_configurator
SHELL ["bash", "-c"]
COPY dfx.json config.sh /build/
COPY scripts/network-config /build/scripts/network-config
COPY scripts/dfx-canister-url /build/scripts/dfx-canister-url
COPY scripts/clap.bash /build/scripts/clap.bash
WORKDIR /build
RUN mkdir -p frontend
ENV DFX_NETWORK=mainnet
RUN ./config.sh
RUN didc encode "$(cat nns-dapp-arg-${DFX_NETWORK}.did)" | xxd -r -p >nns-dapp-arg-${DFX_NETWORK}.bin

# Title: Image to build the nns-dapp frontend.
FROM builder AS build_frontend
SHELL ["bash", "-c"]
COPY ./frontend /build/frontend
# ... If .env has been copied in, it can cause this entire stage to miss the cache.
#     The .dockerignore _should_ prevent it from appearing here.
RUN if test -e /build/frontend/.env ; then echo "ERROR: There should be no frontend/.env in docker!" ; exit 1 ; fi
COPY --from=mainnet_configurator /build/frontend/.env /build/frontend/.env
COPY ./build-frontend.sh /build/
COPY ./scripts/require-dfx-network.sh /build/scripts/
WORKDIR /build
RUN ( cd frontend && npm ci )
RUN ./build-frontend.sh

# Title: Image to build the nns-dapp backend.
FROM builder AS build_nnsdapp
SHELL ["bash", "-c"]
COPY ./rs/backend /build/rs/backend
COPY ./rs/proposals /build/rs/proposals
COPY ./scripts/nns-dapp/test-exports /build/scripts/nns-dapp/test-exports
COPY ./scripts/clap.bash /build/scripts/clap.bash
COPY ./build-backend.sh /build/
COPY ./scripts/nns-dapp/flavours.bash /build/scripts/nns-dapp/flavours.bash
COPY ./build-rs.sh /build/
COPY ./Cargo.toml /build/
COPY ./Cargo.lock /build/
COPY ./dfx.json /build/
COPY --from=build_frontend /build/assets.tar.xz /build/
WORKDIR /build
# We need to make sure that the rebuild happens if the code has changed.
# - Docker checks whether the filesystem or command line have changed, so it will
#   run if there are code changes and skip otherwise.  Perfect.
# - However cargo _may_ then look at the mtime and decide that no, or only minimal,
#   rebuilding is necessary due to the potentially recent dependency building step above.
#   Cargo checks whether the mtime of some code is newer than its last build, like
#   it's 1974, unlike bazel that uses checksums.
# So we update the timestamps of the root code files.
# Old canisters use src/main.rs, new ones use src/lib.rs.  We update the timestamps on all that exist.
# We don't wish to update the code from main.rs to lib.rs and then have builds break.
RUN touch --no-create rs/backend/src/main.rs rs/backend/src/lib.rs rs/proposals/src/lib.rs
RUN ./build-backend.sh
COPY ./scripts/dfx-wasm-metadata-add /build/scripts/dfx-wasm-metadata-add
ARG COMMIT
RUN . scripts/nns-dapp/flavours.bash && for flavour in "${NNS_DAPP_BUILD_FLAVOURS[@]}" ; do scripts/dfx-wasm-metadata-add --commit "$COMMIT" --canister_name nns-dapp --wasm "nns-dapp_$flavour.wasm.gz" --verbose ; done
RUN scripts/dfx-wasm-metadata-add --commit "$COMMIT" --canister_name nns-dapp --wasm nns-dapp.wasm.gz --verbose

# Title: Image to build the sns aggregator, used to increase performance and reduce load.
# Args: None.
#       The SNS aggregator needs to know the canister ID of the
#       NNS-SNS-wasm canister.  That is hard-wired but should be
#       configurable
FROM builder AS build_aggregate
SHELL ["bash", "-c"]
COPY ./rs/sns_aggregator /build/rs/sns_aggregator
COPY ./build-sns-aggregator.sh /build/build-sns-aggregator.sh
COPY ./build-rs.sh /build/build-rs.sh
COPY ./Cargo.toml /build/Cargo.toml
COPY ./Cargo.lock /build/Cargo.lock
COPY ./dfx.json /build/dfx.json
WORKDIR /build
# Ensure that the code is newer than any cache.
RUN touch --no-create rs/sns_aggregator/src/main.rs rs/sns_aggregator/src/lib.rs
RUN RUSTFLAGS="--cfg feature=\"reconfigurable\"" ./build-sns-aggregator.sh
RUN mv sns_aggregator.wasm.gz sns_aggregator_dev.wasm.gz
RUN ./build-sns-aggregator.sh
COPY ./scripts/clap.bash /build/scripts/clap.bash
COPY ./scripts/dfx-wasm-metadata-add /build/scripts/dfx-wasm-metadata-add
ARG COMMIT
RUN for wasm in sns_aggregator.wasm.gz sns_aggregator_dev.wasm.gz ; do scripts/dfx-wasm-metadata-add --commit "$COMMIT" --canister_name sns_aggregator --verbose --wasm "$wasm" ; done

# Title: Image used to extract the final outputs from previous steps.
FROM scratch AS scratch
COPY --from=configurator /build/deployment-config.json /
COPY --from=configurator /build/nns-dapp-arg* /
# Note: The frontend/.env is kept for use with test deployments only.
COPY --from=configurator /build/frontend/.env /frontend-config.sh
COPY --from=build_nnsdapp /build/nns-dapp.wasm.gz /
COPY --from=build_nnsdapp /build/nns-dapp_test.wasm.gz /
COPY --from=build_nnsdapp /build/nns-dapp_production.wasm.gz /
COPY --from=build_nnsdapp /build/nns-dapp_noassets.wasm.gz /nns-dapp_noassets.wasm.gz
COPY --from=build_nnsdapp /build/assets.tar.xz /
COPY --from=build_frontend /build/sourcemaps.tar.xz /
COPY --from=build_aggregate /build/sns_aggregator.wasm.gz /
COPY --from=build_aggregate /build/sns_aggregator_dev.wasm.gz /
