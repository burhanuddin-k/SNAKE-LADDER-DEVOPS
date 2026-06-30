pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo "Building Snake & Ladder Game..."
            }
        }

        stage('Test') {
            steps {
                echo "Running Tests..."
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                echo "Deployment stage"
                '''
            }
        }
    }
}