#!/bin/sh

# Aguardar o banco de dados estar disponível
echo "Aguardando banco de dados estar disponível..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Banco de dados está disponível!"

# Iniciar a aplicação (o Spring Boot executará as migrations automaticamente)
echo "Iniciando aplicação..."
exec java -jar app.jar 