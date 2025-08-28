#!/bin/sh

# Aguardar o banco de dados estar disponível
echo "Aguardando banco de dados estar disponível..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Banco de dados está disponível!"

# Executar repair do Flyway se necessário
echo "Executando repair do Flyway..."
java -cp app.jar org.flywaydb.commandline.Main repair -url=jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME -user=$DB_USERNAME -password=$DB_PASSWORD

# Executar migrations do Flyway
echo "Executando migrations do Flyway..."
java -cp app.jar org.flywaydb.commandline.Main migrate -url=jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME -user=$DB_USERNAME -password=$DB_PASSWORD

# Iniciar a aplicação
echo "Iniciando aplicação..."
exec java -jar app.jar 