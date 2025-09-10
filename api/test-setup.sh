#!/bin/bash

echo "🔍 Testando configuração do projeto Nutri Thata API..."

echo "1. Verificando se o Maven funciona..."
./mvnw --version

echo "2. Verificando se o projeto compila..."
./mvnw clean compile

echo "3. Verificando se o Docker funciona..."
docker --version

echo "4. Verificando se o docker-compose funciona..."
docker-compose --version

echo "5. Verificando configuração do docker-compose..."
docker-compose config

echo "6. Tentando iniciar os containers..."
docker-compose up -d

echo "7. Verificando status dos containers..."
docker-compose ps

echo "8. Verificando logs da API..."
docker-compose logs api

echo "✅ Teste concluído!"



