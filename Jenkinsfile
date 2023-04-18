pipeline {
    agent any
    environment {
        SONAR_HOST_URL = 'https://sonarcloud.io';
        SONARQUBE_SERVER = 'SonarQube';
        DOCKER_REGISTRY = 'docker.io';
        DOCKER_IMAGE = 'my-image';
        version = 'latest';
    }
    triggers {
        githubPush()
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
//         stage('SonarQube Scan') {
//             steps {
//                 withSonarQubeEnv(SONARQUBE_SERVER) {
//                     sh '''
//                         ./sonar-scanner \
//                         -Dsonar.projectKey=ngthminhdev_CompanyExchanges \
//                         -Dsonar.projectName=CompanyExchanges \
//                         -Dsonar.organization=ngthminhdev \
//                         -Dsonar.host.url=${SONAR_HOST_URL} \
//                         -Dsonar.login=${SONAR_TOKEN} \
//                         -Dsonar.qualitygate.wait=true
//                     '''
//                 }
//             }
//         }
        stage('Get package version') {
            steps {
                sh '''
                    echo "::set-output name=version::$(cat package.json | jq -r '.version')"
                '''
            }
        }
        stage('Compress code') {
            steps {
                sh '''
                    chmod +x ./compress.sh && ./compress.sh
                '''
            }
        }
        stage('Build and push image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB', usernameVariable: 'ngthminhdev', passwordVariable: 'kimlien0602')]) {
                    script {
                        def dockerImage = docker.build("${DOCKER_REGISTRY}/ngthminhdev/stock-docker-hub:${version}")
                        docker.withRegistry("https://${DOCKER_REGISTRY}", "docker") {
                            dockerImage.push()
                        }
                    }
                }
            }
        }
//         stage('Setup Docker Buildx') {
//             steps {
//                 script {
//                     def buildx = dockerTool.getDescriptor().getBuildx()
//                     docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
//                         docker.buildx(buildx: buildx, args: '--allow 775')
//                     }
//                 }
//             }
//         }
        stage('Build and push docker image') {
            steps {
                script {
                    docker.build(
                        "ngthminhdev/stock-docker-hub:${version}",
                        './docker',
                        '--progress plain'
                    )
                    docker.withRegistry('https://index.docker.io/v1/', 'DOCKER_HUB') {
                        docker.push("ngthminhdev/stock-docker-hub:${version}")
                    }
                }
            }
        }
        stage('SSH Deploy Development') {
            steps {
                script {
                    sshagent(['SSH_CREDENTIALS']) {
                        sshCommand remoteUser: "beta", remotePassword: "Beta123", remoteHost: "192.168.9.150", port: "22", command: "export TAG=${version} && cd ~/services/b-infor-backend && sudo chmod +x ./deploy.sh && ./deploy.sh"
                    }
                }
            }
        }
    }
}
