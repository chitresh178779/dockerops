# DockerOps player sandbox image.
# Each game session gets ONE container built from this image, run --privileged
# with its own isolated Docker-in-Docker engine. Players get a real shell (via
# `docker exec`) with the real `docker` CLI talking to THIS inner engine only.
# They never see or touch the host's Docker socket.
FROM docker:27-dind

RUN apk add --no-cache \
    bash \
    curl \
    wget \
    jq \
    coreutils \
    procps \
    nano \
    docker-cli-compose

# Non-root shell login is intentionally NOT used: dockerd itself requires root
# inside this isolated container, and this container has no access to
# anything on the host beyond what Docker Desktop grants a --privileged
# container. Isolation boundary is the container itself (see sandbox-manager).

RUN mkdir -p /root/workspace
WORKDIR /root/workspace

COPY entrypoint.sh /usr/local/bin/sandbox-entrypoint.sh
RUN chmod +x /usr/local/bin/sandbox-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/sandbox-entrypoint.sh"]
