pipeline {
  agent any
  environment { IMAGE_NAME = 'agentlab'; COMPOSE_PROJECT_NAME = 'agentlab' }
  options { buildDiscarder(logRotator(numToKeepStr: '10')); timestamps() }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Version') { steps { sh '''printf '{\"version\":\"%s\",\"commit\":\"%s\"}' "$BUILD_NUMBER" "$GIT_COMMIT" > site/version.json''' } }
    stage('Validate') { steps { sh 'docker compose config' } }
    stage('Build') { steps { sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER -t $IMAGE_NAME:latest .' } }
    stage('Deploy') { steps { sh 'APP_VERSION=$BUILD_NUMBER docker compose up -d --no-build --force-recreate' } }
    stage('Health Check') { steps { sh 'curl --fail --retry 10 --retry-delay 2 --retry-connrefused http://agentlab-proxy/' } }
  }
  post { always { sh 'docker compose ps || true' } }
}
