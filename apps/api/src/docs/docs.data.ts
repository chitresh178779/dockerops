export interface DocPage {
  slug: string;
  title: string;
  concept: "containers" | "images" | "networks" | "volumes" | "compose" | "dockerfile" | "troubleshooting" | "security";
  shortExplanation: string;
  body: string;
  syntax: string[];
  commonFlags: { flag: string; description: string }[];
}

export const DOC_PAGES: DocPage[] = [
  {
    slug: "containers-run",
    title: "Running containers",
    concept: "containers",
    shortExplanation: "docker run creates AND starts a container from an image in one step.",
    body: "A container only serves traffic once it exists (created) and is started. `docker run` does both. If the image isn't present locally, Docker pulls it first.",
    syntax: ["docker run [flags] <image> [command]"],
    commonFlags: [
      { flag: "-d", description: "Detached: run in the background instead of attaching your terminal." },
      { flag: "--name <name>", description: "Give the container a memorable name instead of a random one." },
      { flag: "-p <host>:<container>", description: "Publish a container port to a host port." },
      { flag: "-e KEY=VALUE", description: "Set an environment variable inside the container." },
      { flag: "-v <volume>:<path>", description: "Mount a named volume or host path into the container." },
      { flag: "--network <name>", description: "Attach the container to a specific Docker network." },
      { flag: "--restart <policy>", description: "Restart policy: no, on-failure, always, unless-stopped." },
    ],
  },
  {
    slug: "containers-lifecycle",
    title: "Container lifecycle",
    concept: "containers",
    shortExplanation: "Containers move through created → running → stopped/exited → removed.",
    body: "Stopping a container does not delete it — Docker keeps its filesystem and metadata so you can inspect what happened or start it again. Only `docker rm` removes it permanently.",
    syntax: [
      "docker start <container>",
      "docker stop <container>",
      "docker restart <container>",
      "docker rm <container>",
    ],
    commonFlags: [
      { flag: "-f", description: "Force: stop a running container before removing it." },
      { flag: "-t <seconds>", description: "Grace period before Docker sends SIGKILL on stop." },
    ],
  },
  {
    slug: "containers-inspecting",
    title: "Inspecting containers",
    concept: "containers",
    shortExplanation: "docker ps only shows running containers by default — use -a to see everything.",
    body: "docker ps shows the running slice of the truth. Add -a to see stopped and exited containers too. docker inspect returns the full JSON configuration of a resource: networks, mounts, environment, health, exit codes.",
    syntax: ["docker ps", "docker ps -a", "docker inspect <container>", "docker logs <container>"],
    commonFlags: [
      { flag: "-a, --all", description: "Show all containers, not just running ones." },
      { flag: "-f, --follow", description: "(logs) Stream new log output instead of exiting immediately." },
      { flag: "--format", description: "Render output using a Go template, e.g. '{{json .}}'." },
    ],
  },
  {
    slug: "images-pull-tag",
    title: "Images, tags and pulling",
    concept: "images",
    shortExplanation: "An image is a template; a tag is a version label; a container is a running instance.",
    body: "Repository:tag identifies a specific image (nginx:1.25). 'latest' is just a tag, not automatically the newest build. Pulling the wrong tag is one of the most common production incidents.",
    syntax: ["docker pull <repo>:<tag>", "docker images", "docker tag <src> <dst>", "docker rmi <image>"],
    commonFlags: [{ flag: "-a", description: "(images) Show intermediate/all images, not just top-level ones." }],
  },
  {
    slug: "networking-basics",
    title: "Docker networks",
    concept: "networks",
    shortExplanation: "Containers on the same Docker network can reach each other by container name.",
    body: "Docker's default bridge network barely does DNS resolution by name. A user-defined bridge network gives you real container-name-based service discovery, and isolates services that shouldn't be able to reach each other.",
    syntax: ["docker network ls", "docker network create <name>", "docker network connect <net> <container>", "docker network inspect <name>"],
    commonFlags: [{ flag: "--driver <driver>", description: "bridge (default, single host) is what you'll use most in this game." }],
  },
  {
    slug: "networking-ports",
    title: "Ports and publishing",
    concept: "networks",
    shortExplanation: "-p <host>:<container> maps a host port to a container port so outside traffic can reach it.",
    body: "Two containers can't publish the same host port. 'Port already in use' almost always means something else already bound that host port — check what's already running before reassigning it.",
    syntax: ["docker run -p <hostPort>:<containerPort> <image>", "docker port <container>"],
    commonFlags: [],
  },
  {
    slug: "volumes-basics",
    title: "Volumes and persistence",
    concept: "volumes",
    shortExplanation: "A container's own filesystem disappears when it's removed. Volumes survive.",
    body: "If application data lives only inside the container's writable layer, removing or recreating the container destroys it. A named volume mounted at the right path keeps data alive across restarts and redeploys.",
    syntax: ["docker volume ls", "docker volume create <name>", "docker volume inspect <name>", "docker run -v <volume>:<path> <image>"],
    commonFlags: [{ flag: ":ro", description: "Mount read-only, e.g. -v config:/etc/app:ro" }],
  },
  {
    slug: "dockerfile-basics",
    title: "Writing a Dockerfile",
    concept: "dockerfile",
    shortExplanation: "A Dockerfile is a recipe: each instruction adds one layer to the resulting image.",
    body: "Layers are cached. Ordering matters — put things that change rarely (dependency installs) before things that change often (application source) so rebuilds stay fast.",
    syntax: ["FROM <image>", "WORKDIR /app", "COPY . .", "RUN <command>", "CMD [\"executable\"]"],
    commonFlags: [{ flag: "docker build -t <tag> .", description: "Build an image from the Dockerfile in the current directory." }],
  },
  {
    slug: "compose-basics",
    title: "Docker Compose",
    concept: "compose",
    shortExplanation: "Compose describes a multi-container application as one YAML file.",
    body: "`depends_on` controls start order, not readiness — a database container can be 'running' long before it's actually ready to accept connections. That gap is where a lot of real incidents live.",
    syntax: ["docker compose up -d", "docker compose ps", "docker compose logs -f <service>", "docker compose down"],
    commonFlags: [{ flag: "-d", description: "Detached mode, same meaning as docker run -d." }],
  },
  {
    slug: "troubleshooting-health",
    title: "Health checks & diagnosis",
    concept: "troubleshooting",
    shortExplanation: "A container can be 'running' and still be broken — that's what health checks are for.",
    body: "Docker's HEALTHCHECK runs a command on an interval and tracks starting/healthy/unhealthy. 'Running' only means the process hasn't exited; 'healthy' means it's actually answering.",
    syntax: ["docker inspect --format='{{json .State.Health}}' <container>"],
    commonFlags: [],
  },
  {
    slug: "security-basics",
    title: "Docker security fundamentals",
    concept: "security",
    shortExplanation: "Least privilege applies to containers too: don't run as root, don't over-mount, don't leak secrets into images.",
    body: "Environment variables baked into an image at build time end up in its layers permanently. Prefer runtime secrets/env injection, non-root users, and read-only mounts wherever the app allows it.",
    syntax: ["docker run --user <uid:gid> <image>", "docker run --read-only <image>"],
    commonFlags: [{ flag: "--user", description: "Run the container process as a specific non-root user." }],
  },
];
