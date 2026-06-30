stage('Deploy') {
    steps {
        sh '''
        sudo rm -rf /var/www/html/*
        sudo cp -r index.html style.css script.js /var/www/html/
        '''
    }
}