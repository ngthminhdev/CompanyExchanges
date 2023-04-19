pipeline {
    agent {
        docker {
            image 'registry.hub.docker.com/library/ubuntu:latest'
            }
    }
    environment {
        registryUrl = "https://index.docker.io/v1/"
        credentialsId = "DOCKER_CE_HUB"
        dockerImageName = "stock-docker-hub"
        dockerfilePath = "./docker"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Get version') {
            steps {
                sh 'chmod +rw package.json'
                script {
                    VERSION = sh(returnStdout: true, script: "cat package.json | jq -r '.version'").trim()
                    echo "Version: $VERSION"
                }
            }
        }

        stage('Compress Code') {
            steps {
                sh 'chmod +x ./compress.sh && ./compress.sh'
            }
        }

        stage('Build and Push Docker Image') {

            steps {
                script {
                    withDockerRegistry([credentialsId: credentialsId, url: registryUrl]) {
                        def dockerImage = docker.build("ngthminhdev/stock-docker-hub:${VERSION}", "./docker")
                        dockerImage.push()
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}