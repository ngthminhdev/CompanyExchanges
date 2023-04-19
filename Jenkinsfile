pipeline {
    agent any
    environment {
        registryUrl = "https://index.docker.io/v1/"
        credentialsId = "DOCKER_CE_HUB"
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

        stage('Deploy to 7.20') {
            steps {
                script {
                    sh 'ls -l'
                }
            }
        }

//         stage('Deploy to EC2') {
//             steps {
//                 script {
//                     def remote = [:]
//                     remote.name = 'Leader'
//                     remote.host = 'ec2-52-77-145-158.ap-southeast-1.compute.amazonaws.com'
//                     remote.user = 'ubuntu'
//                     remote.allowAnyHosts = true
//                     remote.identityFile = credentials('leader-key.pem')
//                     sshCommand remote: remote, command: 'export TAG=${VERSION} && cd ~/stock-server && chmod +x ./deploy.sh && ./deploy.sh'
//                 }
//             }
//         }
    }
    post {
        always {
            cleanWs()
        }
    }
}