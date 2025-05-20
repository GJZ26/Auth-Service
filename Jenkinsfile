pipeline {
    agent any

    parameters {
        string(name: 'APP_NAME', defaultValue: 'Auth Service', description: 'Nombre de la aplicación')
        string(name: 'EC2_HOST', defaultValue: 'ec2-xx-xx-xx-xx.compute-1.amazonaws.com', description: 'Host o IP pública de la instancia EC2')
    }

    environment {
        EC2_USER = 'ubuntu'
        SSH_KEY = credentials('auth-key') // Asegúrate de que esta credential sea de tipo "SSH Username with private key"
        REMOTE_PATH = "/home/ubuntu/auth-service"
        GIT_REPO = "https://github.com/GJZ26/Auth-Service.git"
        GIT_BRANCH = "dev"
    }

    stages {
        stage('Preparar EC2') {
            steps {
                sshagent(credentials: ['auth-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no \${EC2_USER}@\${params.EC2_HOST} << EOF
                        # Instalar Docker y Docker Compose si es necesario
                        if ! command -v docker &> /dev/null; then
                            sudo apt update -y
                            sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
                            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
                            sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
                            sudo apt update -y
                            sudo apt install -y docker-ce
                            sudo systemctl enable docker
                            sudo systemctl start docker
                        fi

                        if ! command -v docker-compose &> /dev/null; then
                            sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\\$(uname -s)-\\$(uname -m)" -o /usr/local/bin/docker-compose
                            sudo chmod +x /usr/local/bin/docker-compose
                        fi

                        # Clonar o actualizar el repositorio
                        if [ ! -d "\${REMOTE_PATH}" ]; then
                            git clone -b \${GIT_BRANCH} \${GIT_REPO} \${REMOTE_PATH}
                        else
                            cd \${REMOTE_PATH}
                            git fetch origin
                            git reset --hard origin/\${GIT_BRANCH}
                        fi
                        EOF
                    """
                }
            }
        }

        stage('Construir y Desplegar') {
            steps {
                sshagent(credentials: ['auth-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no \${EC2_USER}@\${params.EC2_HOST} << EOF
                        cd \${REMOTE_PATH}

                        # Eliminar contenedor e imagen anteriores
                        sudo docker stop auth-service || true
                        sudo docker rm auth-service || true
                        sudo docker rmi auth-service || true

                        # Construir nueva imagen
                        sudo docker build --build-arg APP_NAME="\${params.APP_NAME}" -t auth-service .

                        # Ejecutar nuevo contenedor
                        sudo docker run -d --name auth-service -p 80:80 auth-service

                        # Verificar que está corriendo
                        sudo docker ps | grep auth-service
                        EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Despliegue completado con éxito!'
        }
        failure {
            echo '❌ El despliegue ha fallado.'
        }
    }
}
