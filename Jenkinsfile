pipeline {
    agent any
    
    stages {
        stage('Conexión a EC2') {
            steps {
                sshagent(['auth-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@ec2-instance << EOF
                        
                        # Verificar si Docker está instalado
                        if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
                            echo "Docker y Docker Compose ya están instalados. No se realizará ninguna acción."
                        else
                            # Actualizar paquetes y dependencias necesarias
                            sudo apt update -y
                            sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

                            # Instalar Docker si no está instalado
                            if ! command -v docker &> /dev/null; then
                                echo "Instalando Docker..."
                                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
                                sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
                                sudo apt update -y
                                sudo apt install -y docker-ce
                                sudo systemctl enable docker
                                sudo systemctl start docker
                                echo "Docker instalado correctamente."
                            else
                                echo "Docker ya está instalado."
                            fi

                            # Instalar Docker Compose si no está instalado
                            if ! command -v docker-compose &> /dev/null; then
                                echo "Instalando Docker Compose..."
                                sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
                                sudo chmod +x /usr/local/bin/docker-compose
                                echo "Docker Compose instalado correctamente: \$(docker-compose --version)"
                            else
                                echo "Docker Compose ya está instalado."
                            fi
                        fi
                        EOF
                    '''
                }
            }
        }
        
        stage('Despliegue') {
            steps {
                sshagent(['auth-key']) {
                    sh '''
                        # Copiar archivos al servidor
                        scp -r -o StrictHostKeyChecking=no ./* ubuntu@ec2-instance:/home/ubuntu/auth-service/
                        
                        # Construir y ejecutar el contenedor
                        ssh -o StrictHostKeyChecking=no ubuntu@ec2-instance << EOF
                            cd /home/ubuntu/auth-service
                            
                            # Construir la imagen con el parámetro APP_NAME
                            sudo docker build --build-arg APP_NAME="AppName" -t auth-service .
                            
                            # Detener el contenedor si ya está en ejecución
                            sudo docker stop auth-service || true
                            sudo docker rm auth-service || true
                            
                            # Ejecutar el nuevo contenedor
                            sudo docker run -d --name auth-service -p 80:80 auth-service
                            
                            # Verificar que el contenedor esté en ejecución
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