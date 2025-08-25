# Inventário de Endpoints Derivados do Frontend

## Análise do Frontend

### Telas Identificadas:
1. **Index.tsx** - Router principal com navegação entre views
2. **PatientHome.tsx** - Home do paciente com listagem de módulos
3. **AdminDashboard.tsx** - Dashboard do profissional para CRUD de módulos
4. **Profile.tsx** - Perfil do usuário (dados pessoais e profissionais)
5. **ModuleViewer.tsx** - Visualização de conteúdo dos módulos
6. **NotFound.tsx** - Página 404

### Entidades Mockadas:
1. **Module** - Módulos educacionais
2. **ContentBlock** - Blocos de conteúdo (text, video, audio)
3. **Nutritionist** - Dados do profissional

### Funcionalidades Identificadas:
- CRUD completo de módulos (criar, editar, deletar, listar)
- Upload de mídia (imagem, vídeo, áudio) via arquivo ou URL
- Gestão de perfil (dados pessoais e profissionais)
- Visualização de conteúdo por pacientes
- Filtros por categoria

## Endpoints Necessários

### 1. Autenticação e Autorização

#### POST /auth/register/patient
- **Origem**: Sistema de convites (não implementado no front ainda)
- **Método**: POST
- **Body**: `{ "name": "string", "email": "string", "password": "string", "phone?": "string", "birthDate?": "string" }`
- **Response**: 
```json
{
  "status": "success",
  "message": "Paciente registrado com sucesso",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "PATIENT"
    }
  }
}
```
- **HTTP Codes**: 201 (created), 409 (email já existe), 422 (validation error)
- **RBAC**: Público

#### POST /auth/login
- **Origem**: Necessário para login (não visível no mock atual)
- **Método**: POST
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: Mesma estrutura do register
- **HTTP Codes**: 200 (success), 401 (credenciais inválidas), 422 (validation)
- **RBAC**: Público

#### POST /auth/refresh
- **Origem**: Renovação de tokens
- **Método**: POST
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response**: `{ "status": "success", "data": { "token": "new_jwt" } }`
- **HTTP Codes**: 200, 401 (token inválido)
- **RBAC**: Autenticado

#### GET /auth/me
- **Origem**: Verificação de usuário logado
- **Método**: GET
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "status": "success", "data": { "user": {...} } }`
- **HTTP Codes**: 200, 401
- **RBAC**: Autenticado

### 2. Gestão de Usuários

#### GET /users/me
- **Origem**: Profile.tsx (linha 17-23)
- **Método**: GET
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "birthDate": "1990-01-01",
    "role": "PATIENT"
  }
}
```
- **HTTP Codes**: 200, 401
- **RBAC**: Owner

#### PATCH /users/me
- **Origem**: Profile.tsx (handleSaveProfile - linha 25)
- **Método**: PATCH
- **Body**: `{ "name?": "string", "phone?": "string", "birthDate?": "string" }`
- **Response**: `{ "status": "success", "message": "Perfil atualizado", "data": {...} }`
- **HTTP Codes**: 200, 401, 422
- **RBAC**: Owner

### 3. Gestão de Profissionais

#### GET /professionals/me
- **Origem**: Profile.tsx (dados da nutricionista - linha 17)
- **Método**: GET
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Dra. Ana Paula Silva",
    "title": "Nutricionista Clínica",
    "bio": "Especialista em nutrição funcional...",
    "image": "url_da_imagem",
    "specialties": ["Nutrição Funcional", "Emagrecimento"]
  }
}
```
- **HTTP Codes**: 200, 401, 404
- **RBAC**: PROFESSIONAL, ADMIN

#### PATCH /professionals/me
- **Origem**: Profile.tsx (handleSaveNutritionist - linha 30)
- **Método**: PATCH
- **Body**: `{ "name?": "string", "title?": "string", "bio?": "string", "image?": "string", "specialties?": ["string"] }`
- **Response**: `{ "status": "success", "message": "Dados profissionais atualizados", "data": {...} }`
- **HTTP Codes**: 200, 401, 422
- **RBAC**: PROFESSIONAL, ADMIN

#### POST /admin/professionals
- **Origem**: Criação de profissionais por admin
- **Método**: POST
- **Body**: 
```json
{
  "user": {
    "name": "string",
    "email": "string",
    "password": "string"
  },
  "professional": {
    "title": "string",
    "bio": "string",
    "specialties": ["string"]
  }
}
```
- **Response**: `{ "status": "success", "message": "Profissional criado", "data": {...} }`
- **HTTP Codes**: 201, 401, 403, 409, 422
- **RBAC**: ADMIN

### 4. Gestão de Módulos

#### GET /modules
- **Origem**: PatientHome.tsx (mockModules - linha 17), AdminDashboard.tsx (linha 22)
- **Método**: GET
- **Query Params**: `?category=string&page=int&size=int`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "status": "success",
  "data": {
    "modules": [
      {
        "id": "1",
        "title": "Introdução à Alimentação Saudável",
        "description": "Fundamentos básicos...",
        "coverImage": "url",
        "category": "Fundamentos",
        "createdAt": "2024-01-15",
        "contentCount": 3
      }
    ],
    "totalElements": 10,
    "totalPages": 3,
    "currentPage": 0
  }
}
```
- **HTTP Codes**: 200, 401
- **RBAC**: Autenticado

#### GET /modules/{id}
- **Origem**: ModuleViewer.tsx (visualização completa do módulo)
- **Método**: GET
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "title": "Introdução à Alimentação Saudável",
    "description": "Fundamentos básicos...",
    "coverImage": "url",
    "category": "Fundamentos",
    "createdAt": "2024-01-15",
    "content": [
      {
        "id": "1-1",
        "type": "text",
        "content": "A alimentação saudável...",
        "order": 1
      }
    ]
  }
}
```
- **HTTP Codes**: 200, 401, 404
- **RBAC**: Autenticado

#### POST /modules
- **Origem**: AdminDashboard.tsx (handleSaveModule - linha 87 quando isCreating)
- **Método**: POST
- **Body**:
```json
{
  "title": "string",
  "description": "string", 
  "coverImage": "string",
  "category": "string",
  "content": [
    {
      "type": "text|video|audio",
      "content": "string",
      "order": 1
    }
  ]
}
```
- **Response**: `{ "status": "success", "message": "Módulo criado", "data": {...} }`
- **HTTP Codes**: 201, 401, 403, 422
- **RBAC**: PROFESSIONAL, ADMIN

#### PATCH /modules/{id}
- **Origem**: AdminDashboard.tsx (handleSaveModule - linha 87 quando editingModule)
- **Método**: PATCH
- **Body**: Mesma estrutura do POST (campos opcionais)
- **Response**: `{ "status": "success", "message": "Módulo atualizado", "data": {...} }`
- **HTTP Codes**: 200, 401, 403, 404, 422
- **RBAC**: Owner (criador), ADMIN

#### DELETE /modules/{id}
- **Origem**: AdminDashboard.tsx (handleDeleteModule - linha 124)
- **Método**: DELETE
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "status": "success", "message": "Módulo excluído" }`
- **HTTP Codes**: 204, 401, 403, 404
- **RBAC**: Owner (criador), ADMIN

### 5. Upload de Mídia

#### POST /media/upload
- **Origem**: FileUpload.tsx (handleFileUpload - linha 18)
- **Método**: POST
- **Content-Type**: `multipart/form-data`
- **Body**: `FormData { file: File }`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "status": "success",
  "message": "Upload concluído",
  "data": {
    "id": "uuid",
    "publicUrl": "https://api.example.com/static/...",
    "storage": "LOCAL",
    "type": "IMAGE|VIDEO|AUDIO"
  }
}
```
- **HTTP Codes**: 201, 400 (tipo inválido), 401, 413 (arquivo muito grande)
- **RBAC**: Autenticado

#### POST /media/link
- **Origem**: FileUpload.tsx (handleUrlSubmit - linha 31)
- **Método**: POST
- **Body**: `{ "url": "string", "type": "IMAGE|VIDEO|AUDIO" }`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "status": "success",
  "message": "URL validada e salva",
  "data": {
    "id": "uuid",
    "externalUrl": "url_fornecida",
    "storage": "EXTERNAL_URL",
    "type": "IMAGE|VIDEO|AUDIO"
  }
}
```
- **HTTP Codes**: 201, 400 (URL inválida), 401, 422
- **RBAC**: Autenticado

#### GET /media/my
- **Origem**: Listagem de mídias do usuário
- **Método**: GET
- **Query Params**: `?type=IMAGE|VIDEO|AUDIO&page=int&size=int`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Lista paginada de MediaAsset
- **HTTP Codes**: 200, 401
- **RBAC**: Owner

#### DELETE /media/{id}
- **Origem**: Remoção de mídia
- **Método**: DELETE
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "status": "success", "message": "Mídia removida" }`
- **HTTP Codes**: 204, 401, 403, 404
- **RBAC**: Owner, ADMIN

### 6. Sistema de Convites

#### POST /invites
- **Origem**: Sistema de convite (implementar no frontend)
- **Método**: POST
- **Body**:
```json
{
  "email": "paciente@email.com",
  "prefill": {
    "name": "João Silva",
    "phone": "(11) 99999-9999"
  }
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "status": "success", "message": "Convite enviado", "data": { "inviteId": "uuid" } }`
- **HTTP Codes**: 201, 401, 403, 409 (email já convidado), 422
- **RBAC**: PROFESSIONAL, ADMIN

#### GET /invites/{token}
- **Origem**: Página de registro via convite
- **Método**: GET
- **Response**:
```json
{
  "status": "success",
  "data": {
    "email": "paciente@email.com",
    "prefill": {
      "name": "João Silva",
      "phone": "(11) 99999-9999"
    },
    "isValid": true,
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```
- **HTTP Codes**: 200, 404 (token inválido), 410 (expirado)
- **RBAC**: Público

#### POST /invites/{token}/accept
- **Origem**: Aceitar convite e criar conta
- **Método**: POST
- **Body**: `{ "name": "string", "password": "string", "phone?": "string" }`
- **Response**: Mesma estrutura do register
- **HTTP Codes**: 201, 404, 409 (já aceito), 410 (expirado), 422
- **RBAC**: Público

#### GET /invites
- **Origem**: Listar convites criados pelo profissional
- **Método**: GET
- **Query Params**: `?status=PENDING|ACCEPTED|EXPIRED&page=int&size=int`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Lista paginada de convites
- **HTTP Codes**: 200, 401, 403
- **RBAC**: PROFESSIONAL, ADMIN

#### POST /invites/{id}/resend
- **Origem**: Reenviar convite
- **Método**: POST
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "status": "success", "message": "Convite reenviado" }`
- **HTTP Codes**: 200, 401, 403, 404, 409 (já aceito)
- **RBAC**: Owner (criador), ADMIN

#### POST /invites/{id}/cancel
- **Origem**: Cancelar convite
- **Método**: POST
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "status": "success", "message": "Convite cancelado" }`
- **HTTP Codes**: 200, 401, 403, 404, 409 (já aceito)
- **RBAC**: Owner (criador), ADMIN

## Recursos Estáticos

#### GET /static/**
- **Origem**: Servir arquivos uploadados localmente
- **Método**: GET
- **Response**: Arquivo binário
- **HTTP Codes**: 200, 404
- **RBAC**: Público (para arquivos públicos)

## Resumo de Roles e Permissões

### PATIENT
- Visualizar módulos e conteúdos
- Gerenciar próprio perfil
- Upload de mídia pessoal

### PROFESSIONAL  
- Tudo do PATIENT
- CRUD de módulos próprios
- Gerenciar dados profissionais
- Criar convites para pacientes
- Gerenciar convites próprios

### ADMIN
- Tudo do PROFESSIONAL
- CRUD de todos os módulos
- Criar/gerenciar profissionais
- Gerenciar todos os convites
- Acesso total a mídias

## Funcionalidades Não Implementadas no Frontend (mas necessárias)

1. **Tela de Login** - Necessária para autenticação
2. **Tela de Registro via Convite** - Para aceitar convites
3. **Gestão de Convites** - Para profissionais enviarem convites
4. **Listagem de Pacientes** - Para profissionais visualizarem seus pacientes
5. **Sistema de Notificações** - Para alertas e comunicações