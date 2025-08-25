# Nutri Thata - Plataforma de Educação Nutricional

## 📋 Status do Projeto

### ✅ IMPLEMENTADO (Estrutura Completa)

1. **Documentação Técnica**
   - `docs/endpoints-derived-from-web.md` - Inventário completo de 30+ endpoints
   - `openapi.yaml` - Especificação OpenAPI 3.0 com RBAC
   - Mapeamento completo do frontend React

2. **Backend Spring Boot (Base Completa)**
   - ✅ Estrutura de projeto Maven com Java 21
   - ✅ Configurações completas (application.properties)
   - ✅ Entidades JPA (User, ProfessionalProfile, Module, ContentBlock, MediaAsset, Invite)
   - ✅ Enums (Role, MediaType, StorageType, InviteStatus, ContentType)
   - ✅ Repositories com queries otimizadas
   - ✅ Migrações Flyway (V1 + V2 com dados seed)
   - ✅ DTOs completos (Request/Response)
   - ✅ Configuração de Segurança JWT + RBAC
   - ✅ Filtros de autenticação JWT
   - ✅ Tratamento global de exceções
   - ✅ UserDetailsService
   - ✅ AuthService + AuthController
   - ✅ Mappers MapStruct

3. **Infraestrutura**
   - ✅ docker-compose.yml (PostgreSQL + MailHog + PgAdmin)
   - ✅ Configuração de CORS
   - ✅ Swagger UI habilitado

### 🚧 EM IMPLEMENTAÇÃO (Próximos Passos)

4. **Services Restantes**
   - UserService
   - ProfessionalService  
   - ModuleService
   - MediaService
   - InviteService
   - EmailService

5. **Controllers Restantes**
   - UserController
   - ProfessionalController
   - ModuleController
   - MediaController
   - InviteController
   - AdminController
   - StaticFileController

6. **Funcionalidades Avançadas**
   - Sistema de upload de arquivos
   - Serviço de email para convites
   - Validações de permissões RBAC
   - Agendamento de tarefas (expiração de convites)

7. **Testes**
   - Testes unitários com JUnit
   - Testes de integração com Testcontainers
   - Testes de segurança

8. **Integração Frontend**
   - Remoção de mocks do React
   - Configuração de interceptors HTTP
   - Telas de login/registro
   - Sistema de convites

## 🚀 Como Executar

### 1. Pré-requisitos
- Docker e Docker Compose
- Java 21
- Maven 3.9+

### 2. Subir a Infraestrutura
```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se os serviços estão rodando
docker-compose ps
```

### 3. Executar o Backend
```bash
cd api
./mvnw spring-boot:run
```

### 4. Acessar Serviços
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **MailHog**: http://localhost:8025
- **PgAdmin**: http://localhost:5050 (admin@nutrithata.com / admin123)

### 5. Executar Frontend
```bash
cd web
npm install
npm run dev
```

## 🗃️ Banco de Dados

### Usuários Seed
- **Admin**: admin@nutrithata.com / admin123
- **Profissional**: ana@nutrithata.com / profissional123  
- **Paciente**: joao@email.com / paciente123

### Estrutura
- 6 tabelas principais
- Relacionamentos bem definidos
- Índices otimizados
- Dados de exemplo

## 📱 Endpoints Implementados

### Autenticação ✅
- `POST /auth/login` - Login
- `POST /auth/register/patient` - Registro de paciente
- `POST /auth/refresh` - Renovar token
- `GET /auth/me` - Usuário atual

### Próximos Endpoints (Por Implementar)
- **Usuários**: CRUD completo
- **Profissionais**: Gestão de perfis
- **Módulos**: CRUD com RBAC
- **Mídia**: Upload local + URL externa
- **Convites**: Sistema completo de convites
- **Admin**: Gestão de profissionais

## 🔐 Sistema de Segurança

- **JWT** com HS256
- **RBAC** com 3 roles: PATIENT, PROFESSIONAL, ADMIN
- **CORS** configurado
- **BCrypt** para senhas
- **Interceptador JWT** implementado

## 📊 Arquitetura

```
├── entities/          # Entidades JPA
├── repositories/      # Repositories Spring Data
├── services/          # Lógica de negócio
├── controllers/       # REST Controllers
├── dto/              # Request/Response DTOs
├── security/         # Configuração JWT + Security
├── exception/        # Tratamento de exceções
├── mapper/           # MapStruct mappers
└── config/           # Configurações Spring
```

## 🧪 Testes (A Implementar)

```bash
# Testes unitários
./mvnw test

# Testes de integração com Testcontainers
./mvnw test -Dspring.profiles.active=test
```

## 📋 TODO - Próximas Implementações

1. **PRIORITY 1 - Services & Controllers Restantes**
   - UserService + UserController
   - ModuleService + ModuleController  
   - MediaService + MediaController
   - InviteService + InviteController

2. **PRIORITY 2 - Funcionalidades Core**
   - EmailService (convites)
   - FileUploadService (local + URL)
   - Validações RBAC detalhadas

3. **PRIORITY 3 - Frontend Integration**
   - Remover mocks do React
   - Implementar interceptors
   - Telas de auth e convites

4. **PRIORITY 4 - Testes & Deploy**
   - Testes automatizados
   - CI/CD pipeline
   - Deploy em produção

## 💡 Estrutura de Desenvolvimento

O projeto está estruturado para desenvolvimento ágil:
- **Backend**: Spring Boot com arquitetura limpa
- **Frontend**: React + Vite com TypeScript  
- **Banco**: PostgreSQL com Flyway
- **Docs**: OpenAPI 3.0 completa
- **Infra**: Docker para desenvolvimento local

---

**Status**: Base sólida implementada (70% da estrutura). Pronto para implementação dos serviços restantes e integração frontend.