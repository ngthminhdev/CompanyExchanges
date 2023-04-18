pipeline {
    agent any
    environment {
        SONAR_HOST_URL = 'https://sonarcloud.io'
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
        stage('Install SonarScanner') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    if (scannerHome == null) {
                        def downloadUrl = 'https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.6.2.2472-linux.zip'
                        def toolName = 'SonarScanner'
                        def scannerDir = toolName + '/'
                        def home = pwd() + '/' + scannerDir
                        sh "curl -L ${downloadUrl} -o sonar-scanner.zip"
                        sh "unzip sonar-scanner.zip"
                        sh "mv sonar-scanner-* ${scannerDir}"
                        tool name: toolName, type: 'hudson.plugins.sonar.SonarRunnerInstallation', home: home
                    }
                }
            }
        }
        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=ngthminhdev_CompanyExchanges \
                        -Dsonar.projectName=CompanyExchanges \
                        -Dsonar.organization=ngthminhdev \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_TOKEN} \
                        -Dsonar.qualitygate.wait=true
                    '''
                }
            }
        }
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
        stage('Login Docker') {
            steps {
                withDockerRegistry(
                    credentialsId: "${DOCKER_USERNAME}",
                    url: 'https://index.docker.io/v1/'
                )
            }
        }
        stage('Setup Docker Buildx') {
            steps {
                script {
                    def buildx = dockerTool.getDescriptor().getBuildx()
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        docker.buildx(buildx: buildx, args: '--allow 775')
                    }
                }
            }
        }
        stage('Build and push docker image') {
            steps {
                script {
                    docker.build(
                        "${DOCKER_USERNAME}/${DOCKER_IMAGE}:${version}",
                        './docker',
                        '--progress plain'
                    )
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        docker.push("${DOCKER_USERNAME}/${DOCKER_IMAGE}:${version}")
                    }
                }
            }
        }
        stage('SSH Deploy Development') {
            steps {
                script {
                    sshagent(['SSH_CREDENTIALS']) {
                        sshCommand remoteUser: "${SSH_USERNAME}", remotePassword: "${SSH_PASSWORD}", remoteHost: "${SSH_HOST}", port: "${SSH_PORT}", command: "export TAG=${version} && cd ~/services/b-infor-backend && sudo chmod +x ./deploy.sh && ./deploy.sh"
                    }
                }
            }
        }
    }
}
