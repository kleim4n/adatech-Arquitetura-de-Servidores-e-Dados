pipeline {

    agent any

    environment {
        IMAGE_NAME = 'agentlab'
        PROXY_IMAGE_NAME = 'agentlab-proxy'
        COMPOSE_PROJECT_NAME = 'agentlab'
    }

    options {

        buildDiscarder(
            logRotator(
                numToKeepStr: '10'
            )
        )

        timestamps()
    }


    stages {

        stage('Version') {

            steps {

                sh '''
                    printf '{"version":"%s","commit":"%s"}' \
                    "$BUILD_NUMBER" \
                    "$GIT_COMMIT" \
                    > site/version.json
                '''

                echo "Build: ${BUILD_NUMBER}"
                echo "Commit: ${GIT_COMMIT}"
            }
        }


        stage('Validate') {

            steps {

                sh '''
                    docker compose config
                '''
            }
        }


        stage('Build Web') {

            steps {

                sh '''
                    docker build \
                        -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:latest \
                        .
                '''
            }
        }


        stage('Build Proxy') {

            steps {

                sh '''
                    docker build \
                        -t ${PROXY_IMAGE_NAME}:${BUILD_NUMBER} \
                        -t ${PROXY_IMAGE_NAME}:latest \
                        ./nginx
                '''
            }
        }


        stage('Deploy') {

            steps {

                sh '''
                    APP_VERSION=${BUILD_NUMBER} \
                    docker compose up \
                        -d \
                        --no-build \
                        --force-recreate
                '''
            }
        }


        stage('Health Check') {

            steps {

                sh '''
                    sleep 3

                    docker exec agentlab-proxy \
                        wget \
                        --quiet \
                        --spider \
                        http://127.0.0.1/
                '''
            }
        }


        stage('Status') {

            steps {

                sh '''
                    docker compose ps
                '''

                sh '''
                    docker images \
                        --filter reference=agentlab*
                '''
            }
        }

    }


    post {

        success {

            echo """
            ========================================

            DEPLOY REALIZADO COM SUCESSO

            AgentLab Build: ${BUILD_NUMBER}
            Commit: ${GIT_COMMIT}

            http://agentlab.local

            ========================================
            """
        }


        failure {

            echo """
            ========================================

            FALHA NO PIPELINE

            Build: ${BUILD_NUMBER}

            Consulte o estágio que apresentou erro.

            ========================================
            """
        }


        always {

            sh '''
                docker compose ps || true
            '''
        }

    }

}