#!/bin/bash

echo "🚀 Iniciando deploy da Nutri Thata API..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Erro: Variáveis de ambiente do banco de dados não estão definidas"
    echo "Defina: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD"
    exit 1
fi

# Aguardar o banco de dados estar disponível
echo "⏳ Aguardando banco de dados estar disponível..."
while ! nc -z $DB_HOST $DB_PORT; do
    echo "   Tentando conectar em $DB_HOST:$DB_PORT..."
    sleep 2
done
echo "✅ Banco de dados está disponível!"

# Executar repair do Flyway
echo "🔧 Executando repair do Flyway..."
./mvnw flyway:repair -Dflyway.url=jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME -Dflyway.user=$DB_USERNAME -Dflyway.password=$DB_PASSWORD

if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar repair do Flyway"
    exit 1
fi

# Executar migrations do Flyway
echo "📦 Executando migrations do Flyway..."
./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME -Dflyway.user=$DB_USERNAME -Dflyway.password=$DB_PASSWORD

if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar migrations do Flyway"
    exit 1
fi

echo "✅ Migrations executadas com sucesso!"

# Iniciar a aplicação
echo "🚀 Iniciando aplicação Spring Boot..."
exec java -jar target/nutri_thata_api-0.0.1-SNAPSHOT.jar 