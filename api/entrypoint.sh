#!/bin/sh

echo "🚀 Iniciando Nutri Thata API..."

# Aguardar Redis
echo "⏳ Aguardando Redis estar disponível..."
while ! nc -z redis 6379; do
    echo "   Tentando conectar em redis:6379..."
    sleep 2
done
echo "✅ Redis está disponível!"

# Iniciar aplicação Spring Boot
echo "🚀 Iniciando aplicação Spring Boot..."
exec java -jar app.jar 