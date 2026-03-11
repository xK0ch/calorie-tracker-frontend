pipeline {
  agent any

  tools {
    nodejs '22.22.1'
  }

  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose -f docker-compose-calorie-tracker-frontend.yml down'
        sh 'docker image prune -af'
        sh 'docker compose -f ddocker-compose-calorie-tracker-frontend.yml up --build -d'
      }
    }
  }
}
