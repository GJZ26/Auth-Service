pipeline {
    agent any

    parameters {
        string(name: 'APP_NAME', defaultValue: 'Auth Service', description: 'Nombre de la aplicación')
    }

    stages {
        stage('Preparar EC2') {
            steps {
                sshagent(['auth-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@ec2-instance << EOF
                        
                        # Verificar instalación de Docker y Docker Compose
                        if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
                            sudo apt update -y
                            sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

                            if ! command -v docker &> /dev/null; then
                                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
                                sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
                                sudo apt update -y
                                sudo apt install -y docker-ce
                                sudo systemctl enable docker
                                sudo systemctl start docker
                            fi

                            if ! command -v docker-compose &> /dev/null; then
                                sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                                sudo chmod +x /usr/local/bin/docker-compose
                            fi
                        fi

                        mkdir -p /home/ubuntu/auth-service

                        EOF
                    '''
                }
            }
        }

        stage('Despliegue') {
            steps {
                sshagent(['auth-key']) {
                    sh '''
                        # Copiar archivos al EC2
                        scp -r -o StrictHostKeyChecking=no ./* ubuntu@ec2-instance:/home/ubuntu/auth-service/

                        # Ejecutar comandos en EC2
                        ssh -o StrictHostKeyChecking=no ubuntu@ec2-instance << EOF
                            cd /home/ubuntu/auth-service

                            # Eliminar contenedor anterior si existe
                            sudo docker stop auth-service || true
                            sudo docker rm auth-service || true
                            sudo docker rmi auth-service || true

                            # Construir imagen con nombre de aplicación
                            sudo docker build --build-arg APP_NAME='${APP_NAME}' -t auth-service .

                            # Ejecutar contenedor en el puerto 80
                            sudo docker run -d --name auth-service -p 80:80 auth-service

                            # Mostrar contenedor en ejecución
                            sudo docker ps | grep auth-service
                        EOF
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Despliegue completado con éxito!'
        }
        failure {
            echo 'El despliegue ha fallado!'
        }
    }
}
