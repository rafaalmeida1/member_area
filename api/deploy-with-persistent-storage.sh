#!/bin/bash

# Script para deploy com armazenamento persistente
# Este script garante que os uploads sejam preservados entre deployments

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy com armazenamento persistente..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando!"
    exit 1
fi

# Verificar se o docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    log_error "docker-compose não está instalado!"
    exit 1
fi

log_info "Verificando volumes existentes..."

# Listar volumes existentes
EXISTING_VOLUMES=$(docker volume ls -q)
echo "Volumes existentes:"
echo "$EXISTING_VOLUMES" | grep nutri_thata || echo "Nenhum volume nutri_thata encontrado"

# Verificar se o volume de uploads já existe
UPLOAD_VOLUME_NAME="nutri_thata_api_uploads_data"
if docker volume ls | grep -q "$UPLOAD_VOLUME_NAME"; then
    log_success "Volume de uploads já existe: $UPLOAD_VOLUME_NAME"
    
    # Mostrar informações do volume
    log_info "Informações do volume de uploads:"
    docker volume inspect "$UPLOAD_VOLUME_NAME" --format "Mountpoint: {{.Mountpoint}}"
    
    # Verificar se há arquivos no volume
    UPLOAD_FILES=$(docker run --rm -v "$UPLOAD_VOLUME_NAME":/uploads alpine find /uploads -type f 2>/dev/null | wc -l)
    log_info "Arquivos encontrados no volume: $UPLOAD_FILES"
else
    log_warning "Volume de uploads não existe ainda. Será criado automaticamente."
fi

# Fazer backup dos volumes antes do deploy (opcional, mas recomendado)
log_info "Criando backup dos volumes..."
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if docker volume ls | grep -q "$UPLOAD_VOLUME_NAME"; then
    log_info "Fazendo backup do volume de uploads..."
    docker run --rm \
        -v "$UPLOAD_VOLUME_NAME":/source:ro \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        alpine tar czf /backup/uploads_backup.tar.gz -C /source .
    log_success "Backup criado em: $BACKUP_DIR/uploads_backup.tar.gz"
fi

# Parar containers existentes (sem remover volumes)
log_info "Parando containers existentes..."
docker-compose down --remove-orphans

# Construir e iniciar os serviços
log_info "Construindo e iniciando serviços..."
docker-compose up --build -d

# Aguardar os serviços ficarem prontos
log_info "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
log_info "Verificando status dos serviços..."
docker-compose ps

# Verificar se a API está respondendo
log_info "Verificando se a API está respondendo..."
API_PORT=$(docker-compose port api 8080 | cut -d: -f2)
if curl -f "http://localhost:$API_PORT/actuator/health" > /dev/null 2>&1; then
    log_success "API está respondendo na porta $API_PORT"
else
    log_warning "API ainda não está respondendo. Pode levar alguns segundos..."
fi

# Verificar se o volume foi montado corretamente
log_info "Verificando montagem do volume..."
CONTAINER_ID=$(docker-compose ps -q api)
if [ -n "$CONTAINER_ID" ]; then
    MOUNT_INFO=$(docker inspect "$CONTAINER_ID" --format '{{range .Mounts}}{{if eq .Destination "/app/uploads"}}Volume: {{.Name}}, Source: {{.Source}}{{end}}{{end}}')
    if [ -n "$MOUNT_INFO" ]; then
        log_success "Volume montado corretamente: $MOUNT_INFO"
    else
        log_error "Volume não foi montado corretamente!"
    fi
fi

# Mostrar logs recentes
log_info "Logs recentes da API:"
docker-compose logs --tail=20 api

log_success "Deploy concluído!"
log_info "Próximos passos:"
echo "1. Verifique se a aplicação está funcionando corretamente"
echo "2. Teste o upload de arquivos para confirmar a persistência"
echo "3. Os backups estão em: $BACKUP_DIR"

# Instruções para restaurar backup se necessário
cat << EOF

📋 INSTRUÇÕES PARA RESTAURAR BACKUP (se necessário):

1. Parar a aplicação:
   docker-compose down

2. Restaurar o backup:
   docker run --rm \\
     -v nutri_thata_api_uploads_data:/target \\
     -v $(pwd)/$BACKUP_DIR:/backup \\
     alpine tar xzf /backup/uploads_backup.tar.gz -C /target

3. Reiniciar a aplicação:
   docker-compose up -d

EOF

log_success "Script de deploy finalizado! 🎉"
EOF
