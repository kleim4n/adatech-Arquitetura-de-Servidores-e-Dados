FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update \
    && apt-get install -y \
        docker.io \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

# Docker Compose v2 como plugin do Docker CLI
RUN mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -SL \
       https://github.com/docker/compose/releases/download/v2.40.3/docker-compose-linux-x86_64 \
       -o /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

USER jenkins