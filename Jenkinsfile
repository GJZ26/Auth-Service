pipeline {
    agent any

    /* Parámetros de entrada */
    parameters {
        string(name: 'APP_NAME', defaultValue: 'Auth Service', description: 'Nombre de la aplicación')
        string(name: 'EC2_HOST', defaultValue: 'ec2-xx-xx-xx-xx.compute-1.amazonaws.com', description: 'Host o IP pública de la instancia EC2')
    }

    /* Variables de entorno comunes */
    environment {
        REMOTE_PATH = "/home/ubuntu/auth-service"
        GIT_REPO    = "https://github.com/GJZ26/Auth-Service.git"
        GIT_BRANCH  = "dev"
    }

    stages {
        stage('Preparar EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'keyAgentDev',
                                                  keyFileVariable: 'SSH_KEY_FILE',
                                                  usernameVariable: 'EC2_USER')]) {
                    sh """
                        chmod 600 ${SSH_KEY_FILE}
                        ssh -i ${SSH_KEY_FILE} -o StrictHostKeyChecking=no ${EC2_USER}@${params.EC2_HOST} << 'EOF'
                            set -e

                            # 1) Instalar Docker
                            if ! command -v docker >/dev/null; then
                                sudo apt-get update -y
                                sudo apt-get install -y \
                                    apt-transport-https \
                                    ca-certificates \
                                    curl \
                                    software-properties-common
                                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
                                sudo add-apt-repository \
                                    "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
                                sudo apt-get update -y
                                sudo apt-get install -y docker-ce
                                sudo systemctl enable --now docker
                            fi

                            # 2) Instalar Docker Compose
                            if ! command -v docker-compose >/dev/null; then
                                sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\\\$(uname -s)-\\\$(uname -m)" \
                                     -o /usr/local/bin/docker-compose
                                sudo chmod +x /usr/local/bin/docker-compose
                            fi

                            # 3) Clonar o actualizar repositorio
                            if [ ! -d "${REMOTE_PATH}" ]; then
                                git clone -b ${GIT_BRANCH} ${GIT_REPO} ${REMOTE_PATH}
                            else
                                cd ${REMOTE_PATH}
                                git fetch --all
                                git reset --hard origin/${GIT_BRANCH}
                            fi
                        EOF
                    """
                }
            }
        }

        stage('Construir y Desplegar') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'keyAgentDev',
                                                  keyFileVariable: 'SSH_KEY_FILE',
                                                  usernameVariable: 'EC2_USER')]) {
                    sh """
                        chmod 600 ${SSH_KEY_FILE}
                        ssh -i ${SSH_KEY_FILE} -o StrictHostKeyChecking=no ${EC2_USER}@${params.EC2_HOST} << 'EOF'
                            set -e
                            cd ${REMOTE_PATH}

                            # 1) Limpiar contenedores e imágenes previas
                            sudo docker stop auth-service || true
                            sudo docker rm   auth-service || true
                            sudo docker rmi  auth-service || true

                            # 2) Construir nueva imagen
                            sudo docker build \
                                --build-arg APP_NAME="${params.APP_NAME}" \
                                -t auth-service .

                            # 3) Iniciar contenedor
                            sudo docker run -d \
                                --name auth-service \
                                -p 80:80 \
                                auth-service

                            # 4) Comprobar estado
                            sudo docker ps --filter "name=auth-service"
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
