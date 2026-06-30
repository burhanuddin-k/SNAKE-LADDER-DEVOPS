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
                echo 'Building Snake & Ladder Game...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Tests...'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                sudo rm -rf /var/www/html/*
                sudo cp -r ./* /var/www/html/
                '''
            }
        }
    }
}