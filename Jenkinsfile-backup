pipeline {
    agent any
    environment {
        REGISTRY = "localhost:5000"  // Minikube registry
        REACT_IMAGE = "irada-react"
        DOCKER_HOST = "unix:///var/run/docker.sock"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'master', url: 'https://github.com/ajayparmar311/IRADA.git'
            }
        }
        
        stage('Build ReactJS Image') {
            steps {
                script {
                    sh "docker build -t $REGISTRY/$REACT_IMAGE:latest -f Dockerfile ."
                    sh "docker push $REGISTRY/$REACT_IMAGE:latest"
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh "kubectl apply -f k8s/react-deployment.yaml"
                }
            }
        }
    }
}
