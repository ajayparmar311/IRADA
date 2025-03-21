pipeline {
    agent any
    environment {
        REGISTRY = "localhost:5000"  // Minikube registry
        REACT_IMAGE = "irada-react"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ajayparmar311/IRADA.git'
            }
        }
        
        stage('Build ReactJS Image') {
            steps {
                script {
                    sh "eval $(minikube docker-env)" // Use Minikube's Docker
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
