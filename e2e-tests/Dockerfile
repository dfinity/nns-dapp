# Use this with
#
# docker build . -t nns-dapp-specs
# docker run -d nns-dapp-specs > CONTAINER.txt
# Await docker inspect -f '{{.State.Running}}' $(cat CONTAINER.txt) == "false"
# docker logs $(cat CONTAINER.txt) > report.txt

FROM ubuntu:20.04 as builder
SHELL ["bash", "-c"]

ENV NODE_VERSION=16.17.1

ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt-get -yq update && \
    apt-get -yqq install --no-install-recommends ca-certificates curl moreutils jq

# Install node
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# --- End of common part ---

RUN apt-get -y install moreutils jq

# Install Chrome
RUN curl -sL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb > google-chrome-stable_current_amd64.deb
RUN apt-get -y install ./google-chrome-stable_current_amd64.deb

ADD . /e2e-tests
WORKDIR /e2e-tests
RUN npm install chromedriver@109
RUN npm ci
