#!/bin/sh
set -e

# Start the inner Docker engine in the background.
dockerd-entrypoint.sh --host=unix:///var/run/docker.sock &
DOCKERD_PID=$!

echo "[sandbox] waiting for inner dockerd..."
until docker info >/dev/null 2>&1; do
  sleep 0.5
done
echo "[sandbox] inner dockerd ready"

# Signal readiness for the sandbox manager to poll for.
touch /tmp/sandbox-ready

# Keep the container alive; dockerd runs as PID's child, this process is PID 1.
wait "$DOCKERD_PID"
