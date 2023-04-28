pipeline {
    agent any
    environment {
        registryUrl = "https://index.docker.io/v1/"
        credentialsId = "DOCKER_CE_HUB"
        VERSION = sh(returnStdout: true, script: "cat package.json | jq -r '.version'").trim()
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Get version') {
            steps {
                script {
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
            options {
                timeout(time: 30, unit: 'MINUTES')
            }
            steps {
                script {
                    withDockerRegistry([credentialsId: credentialsId, url: registryUrl]) {
                        def dockerImage = docker.build("ngthminhdev/b-info-backend:${VERSION}", "./docker")
                        dockerImage.push()
                    }
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                script {
                    sh 'echo Beta123 | export TAG=${VERSION} && cd /home/beta/services/b-infor-backend && sudo -S ./deploy.sh'
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
