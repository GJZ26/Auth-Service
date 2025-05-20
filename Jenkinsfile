pipeline {
    agent any

    environment {
        REMOTE_PATH = "/home/ubuntu/auth-service"
    }

    stages {
        stage('Preparar EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: params.CREDENTIAL_ID,
                                                  keyFileVariable: 'SSH_KEY_FILE',
                                                  usernameVariable: 'EC2_USER')]) {
                    sh """
chmod 600 "$SSH_KEY_FILE"
ssh-keygen -f "/var/lib/jenkins/.ssh/known_hosts" -R "${params.EC2_HOST}" || true
ssh -i "$SSH_KEY_FILE" -o StrictHostKeyChecking=no "$EC2_USER"@"${params.EC2_HOST}" << EOF
    set -e
    export DEBIAN_FRONTEND=noninteractive

    # Instalar Docker si no existe
    if ! command -v docker >/dev/null; then
        sudo apt-get update -y
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
        sudo apt-get update -y
        sudo apt-get install -y docker-ce
        sudo systemctl enable --now docker
    fi

    # Instalar Docker Compose si no existe
    if ! command -v docker-compose >/dev/null; then
        ARCH=\$(uname -m)
        OS=\$(uname -s)
        sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\${OS}-\${ARCH}" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi

    # Clonar o actualizar repositorio
    if [ ! -d "${REMOTE_PATH}" ]; then
        git clone -b ${params.GIT_BRANCH} ${params.GIT_REPO} ${REMOTE_PATH}
    else
        cd ${REMOTE_PATH}
        git fetch --all
        git reset --hard origin/${params.GIT_BRANCH}
    fi
EOF
                    """
                }
            }
        }

        stage('Construir y Desplegar') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: params.CREDENTIAL_ID,
                                                  keyFileVariable: 'SSH_KEY_FILE',
                                                  usernameVariable: 'EC2_USER')]) {
                    sh """
chmod 600 "$SSH_KEY_FILE"
ssh-keygen -f "/var/lib/jenkins/.ssh/known_hosts" -R "${params.EC2_HOST}" || true
ssh -i "$SSH_KEY_FILE" -o StrictHostKeyChecking=no "$EC2_USER"@"${params.EC2_HOST}" << EOF
    set -e
    cd ${REMOTE_PATH}

    # Reconstruir imagen
    sudo docker build --build-arg APP_NAME="${params.APP_NAME}" --build-arg JWT_SECRET="${params.JWT_SECRET}" --build-arg DB_NAME="${params.DB_NAME}" --build-arg DB_USER="${params.DB_USER}" --build-arg DB_PASSWORD="${params.DB_PASSWORD}" --build-arg DB_HOST="${params.DB_HOST}" -t auth-service .

    # Parar y eliminar contenedor si existe
    if sudo docker ps -a --format '{{.Names}}' | grep -q '^auth-service\$'; then
        sudo docker stop auth-service || true
        sudo docker rm auth-service || true
    fi

    # Iniciar nuevo contenedor
    sudo docker run -d --name auth-service -p 80:80 auth-service

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
