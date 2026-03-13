pipeline {
    agent any

    environment {
        APP_NAME    = 'smart-hostel-complaint'
        BACKEND_DIR = 'backend'
        DOCKER_IMG  = 'hostel-backend'
    }

    stages {

        // ─── Stage 1: Checkout ──────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '>>> Checking out source code from GitHub...'
                git branch: 'main',
                    url: 'https://github.com/YOUR_USERNAME/smart-hostel-complaint.git'
            }
        }

        // ─── Stage 2: Build ─────────────────────────────────────────
        stage('Maven Build') {
            steps {
                echo '>>> Building Spring Boot application with Maven...'
                dir("${BACKEND_DIR}") {
                    bat 'mvn clean package -DskipTests'
                }
                echo '>>> Build complete: target/complaint-system.jar'
            }
        }

        // ─── Stage 3: Test ──────────────────────────────────────────
        stage('JUnit Tests') {
            steps {
                echo '>>> Running JUnit unit tests...'
                dir("${BACKEND_DIR}") {
                    bat 'mvn test'
                }
            }
            post {
                always {
                    junit "${BACKEND_DIR}/target/surefire-reports/*.xml"
                }
            }
        }

        // ─── Stage 4: Docker Build ──────────────────────────────────
        stage('Docker Build') {
            steps {
                echo '>>> Building Docker images...'
                bat 'docker-compose build'
            }
        }

        // ─── Stage 5: Deploy ────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo '>>> Deploying containers...'
                bat 'docker-compose up -d'
                echo '>>> Application is live at http://localhost:3000'
            }
        }
    }

    post {
        success {
            echo '============================================'
            echo ' PIPELINE SUCCEEDED'
            echo ' App running at http://localhost:3000'
            echo '============================================'
        }
        failure {
            echo '============================================'
            echo ' PIPELINE FAILED — Check logs above'
            echo '============================================'
        }
        always {
            echo '>>> Pipeline finished. Check Jenkins console for details.'
        }
    }
}
