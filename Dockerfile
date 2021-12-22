# Use this with
#
# docker build -t nns-dapp .
# docker run --rm --entrypoint cat nns-dapp /nns-dapp.wasm > nns-dapp.wasm

FROM ubuntu:20.10 as builder
SHELL ["bash", "-c"]

ARG rust_version=1.54.0
ENV NODE_VERSION=14.15.4

ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
        build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake \
	git jq

# Install node
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Install Rust and Cargo in /opt
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH

RUN curl --fail https://sh.rustup.rs -sSf \
        | sh -s -- -y --default-toolchain ${rust_version}-x86_64-unknown-linux-gnu --no-modify-path && \
    rustup default ${rust_version}-x86_64-unknown-linux-gnu && \
    rustup target add wasm32-unknown-unknown

ENV PATH=/cargo/bin:$PATH

RUN curl https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_2.2.3-stable.tar.xz -o flutter.tar.xz
RUN tar xJf flutter.tar.xz
ENV PATH=/flutter/bin:$PATH

# Install IC CDK optimizer
RUN cargo install --version 0.3.1 ic-cdk-optimizer

# Install dfx
COPY dfx.json dfx.json
RUN DFX_VERSION="$(jq -cr .dfx dfx.json)" sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Start the second container
FROM builder
SHELL ["bash", "-c"]
ARG DEPLOY_ENV=mainnet
RUN echo $DEPLOY_ENV

# Build
COPY . .
RUN ./build.sh

# Copy the wasm to the traditional location.
RUN cp "$(jq -rc '.canisters["nns-dapp"].wasm' dfx.json)" nns-dapp.wasm
RUN ls -sh nns-dapp.wasm; sha256sum nns-dapp.wasm
