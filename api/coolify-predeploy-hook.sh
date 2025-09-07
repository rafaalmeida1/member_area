#!/bin/bash

# Coolify Pre-Deploy Hook
# Este script deve ser executado ANTES do deploy no Coolify para preservar uploads

echo "🔧 Coolify Pre-Deploy Hook - Preservando uploads..."

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Nome do volume que será criado
UPLOAD_VOLUME="nutri_thata_api_uploads_data"

# Verificar se já existe um volume de uploads
if docker volume ls | grep -q "$UPLOAD_VOLUME"; then
    log "✅ Volume de uploads já existe: $UPLOAD_VOLUME"
    
    # Contar arquivos existentes
    FILE_COUNT=$(docker run --rm -v "$UPLOAD_VOLUME":/uploads alpine find /uploads -type f 2>/dev/null | wc -l)
    log "📁 Arquivos encontrados no volume: $FILE_COUNT"
    
    # Criar backup de segurança se houver arquivos
    if [ "$FILE_COUNT" -gt 0 ]; then
        BACKUP_DIR="/tmp/nutri_thata_backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        log "💾 Criando backup de segurança em: $BACKUP_DIR"
        docker run --rm \
            -v "$UPLOAD_VOLUME":/source:ro \
            -v "$BACKUP_DIR":/backup \
            alpine tar czf /backup/uploads_backup.tar.gz -C /source .
        
        if [ $? -eq 0 ]; then
            log "✅ Backup criado com sucesso!"
            echo "BACKUP_LOCATION=$BACKUP_DIR/uploads_backup.tar.gz" >> $GITHUB_ENV 2>/dev/null || true
        else
            log "❌ Erro ao criar backup!"
        fi
    fi
else
    log "⚠️  Volume de uploads não existe ainda. Será criado no primeiro deploy."
fi

# Verificar espaço em disco disponível
AVAILABLE_SPACE=$(df / | tail -1 | awk '{print $4}')
log "💾 Espaço disponível em disco: ${AVAILABLE_SPACE}K"

# Alertar se o espaço está baixo (menos de 1GB)
if [ "$AVAILABLE_SPACE" -lt 1048576 ]; then
    log "⚠️  ATENÇÃO: Espaço em disco baixo! Considere limpar arquivos antigos."
fi

# Verificar se o docker-compose.yml tem a configuração correta
if grep -q "uploads_data:/app/uploads" docker-compose.yml; then
    log "✅ docker-compose.yml está configurado corretamente para persistência"
else
    log "❌ ERRO: docker-compose.yml não está configurado para persistência!"
    log "❌ Certifique-se de que o volume está configurado como: uploads_data:/app/uploads"
    exit 1
fi

# Listar todos os volumes relacionados ao projeto
log "📋 Volumes existentes do projeto:"
docker volume ls | grep nutri_thata || log "Nenhum volume do projeto encontrado"

log "🎯 Pre-deploy hook concluído com sucesso!"

# Instruções para o usuário
cat << EOF

📋 RESUMO DO PRE-DEPLOY:
- Volume de uploads: $(docker volume ls | grep -q "$UPLOAD_VOLUME" && echo "✅ Existe" || echo "⚠️  Será criado")
- Backup criado: $([ -n "$BACKUP_DIR" ] && echo "✅ $BACKUP_DIR/uploads_backup.tar.gz" || echo "⚠️  Não necessário")
- Configuração: ✅ Correta

🚀 Pronto para deploy seguro!

EOF
