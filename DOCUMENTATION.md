# AITI.MANAGER — Documentação Técnica do Projeto

> **Versão:** 6.0.0 | **Última atualização:** 2026-03-14

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Sistema de Autenticação e Autorização](#5-sistema-de-autenticação-e-autorização)
6. [Banco de Dados](#6-banco-de-dados)
7. [Edge Functions (Backend)](#7-edge-functions-backend)
8. [Páginas do Dashboard (Frontend)](#8-páginas-do-dashboard-frontend)
9. [Page Builder (Editor de Canvas)](#9-page-builder-editor-de-canvas)
10. [Sincronização com Hardware (Totem)](#10-sincronização-com-hardware-totem)
11. [Sistema de IA](#11-sistema-de-ia)
12. [Fluxos Principais](#12-fluxos-principais)
13. [Variáveis de Ambiente](#13-variáveis-de-ambiente)

---

## 1. Visão Geral

O **AITI.MANAGER** é uma plataforma de gerenciamento de totens interativos com inteligência artificial. O sistema é composto por:

- **Hub (Dashboard Web):** Painel administrativo para gerenciar organizações, dispositivos, configurações de IA e layout visual dos totens.
- **Page Builder:** Editor visual tipo Figma/Canva que gera HTML estático (1080×1920) para os totens.
- **Sync Worker:** Script Node.js (`sync-worker.js`) que roda no hardware local, busca o HTML publicado e serve via HTTP em modo quiosque.
- **Backend (Lovable Cloud):** Edge Functions serverless que fornecem APIs para comunicação entre Hub e Hardware.

### Fluxo Simplificado

```
┌─────────────┐     Edge Functions      ┌──────────────┐
│  Hub (Web)   │ ◄────────────────────► │ Lovable Cloud │
│  Dashboard   │     REST + Realtime     │  (Backend)    │
└──────┬──────┘                          └──────┬───────┘
       │                                        │
       │  Publica HTML                   totem-html (GET)
       │  → published_html               Polling 15s + ETag
       │                                        │
       │                                 ┌──────▼───────┐
       │                                 │ Sync Worker   │
       │                                 │ (Hardware)    │
       │                                 │ HTTP :8080    │
       │                                 │ Kiosk Browser │
       │                                 └──────────────┘
```

---

## 2. Arquitetura do Sistema

### 2.1 Modelo Multi-Tenant

O sistema opera com isolamento por organização:

- **Organizações** → agrupam dispositivos e usuários
- **Dispositivos (Totens)** → pertencem a uma organização
- **Usuários** → vinculados a uma organização com papel definido
- **Configurações de IA** → podem ser por organização (global) ou por dispositivo (específica)

### 2.2 Hierarquia de Precedência (IA)

```
Configuração por Dispositivo > Configuração por Organização > Padrão do Sistema
```

### 2.3 Arquitetura de HTML Estático

O sistema adota uma arquitetura de **HTML estático** para os totens:

1. O **Page Builder** gera um documento HTML/CSS autônomo (1080×1920)
2. Ao publicar, o HTML é armazenado na coluna `published_html` da tabela `devices`
3. A Edge Function `totem-html` serve esse HTML ao sync worker
4. O **Sync Worker** (`sync-worker.js`) opera no hardware local:
   - Servidor HTTP na porta 8080
   - Polling de atualizações via ETags (a cada 15s)
   - Substitui o `index.html` local quando há nova versão
   - Abre e gerencia o navegador em modo quiosque
   - Supervisor embutido com reinício automático

### 2.4 Comunicação Hub ↔ Hardware

| Canal | Direção | Uso |
|-------|---------|-----|
| **Polling** (`totem-html`) | Hardware → Cloud | HTML publicado com cache via ETag |
| **Polling** (`totem-config`) | Hardware → Cloud | Config completa a cada 15s (com verificação de hash) |
| **Heartbeat** (`totem-heartbeat`) | Hardware → Cloud | Status, comandos pendentes |
| **Realtime** (Supabase Channels) | Hub → Hardware | Live preview instantâneo do Page Builder |

---

## 3. Stack Tecnológica

### Hub (Dashboard)
| Tecnologia | Uso |
|------------|-----|
| React 18 + TypeScript | Framework principal |
| Vite | Bundler e dev server |
| Tailwind CSS | Estilização (design system com tokens semânticos) |
| shadcn/ui | Componentes de interface |
| React Router v6 | Roteamento SPA |
| TanStack React Query | Cache e gerenciamento de estado servidor |
| Framer Motion | Animações e transições de página |
| react-rnd | Drag & resize no Page Builder |
| Recharts | Gráficos e métricas |
| Supabase JS SDK | Conexão com backend |

### Hardware Local (Sync Worker)
| Tecnologia | Uso |
|------------|-----|
| Node.js | Runtime do sync worker |
| HTTP server nativo | Servidor local (porta 8080) |
| Navegador (Chromium) | Modo quiosque para exibição |

### Backend Cloud
| Tecnologia | Uso |
|------------|-----|
| Lovable Cloud (Supabase) | Banco de dados, auth, storage, realtime |
| Edge Functions (Deno) | APIs serverless |
| Lovable AI Gateway | LLM cloud (Gemini 3 Flash) |

---

## 4. Estrutura do Projeto

```
├── src/                          # Hub (Dashboard Web)
│   ├── App.tsx                   # Rotas principais
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Design system (tokens CSS)
│   ├── hooks/
│   │   ├── useAuth.tsx           # Contexto de autenticação
│   │   └── use-mobile.tsx        # Detecção de viewport
│   ├── pages/
│   │   ├── Auth.tsx              # Login / Signup
│   │   ├── Dashboard.tsx         # Monitor ao vivo
│   │   ├── Devices.tsx           # Lista de dispositivos
│   │   ├── DeviceDetail.tsx      # Detalhes do dispositivo
│   │   ├── Organizations.tsx     # Hierarquia org → devices
│   │   ├── Users.tsx             # Gerenciamento de usuários
│   │   ├── AIConfigs.tsx         # Configurações de IA
│   │   ├── Settings.tsx          # Configurações gerais
│   │   └── PageEditorPage.tsx    # Page Builder (seletor de device + editor)
│   ├── editor/                   # Page Builder (editor de canvas livre)
│   │   ├── canvas/
│   │   │   ├── FreeFormEditor.tsx # Editor principal do canvas
│   │   │   ├── ElementPalette.tsx # Paleta de elementos (sidebar)
│   │   │   ├── PropertiesPanel.tsx# Painel de propriedades contextual
│   │   │   ├── PagesPanel.tsx    # Gerenciador de páginas/views
│   │   │   ├── PageVariablesContext.tsx # Contexto de variáveis
│   │   │   ├── DraggableElement.tsx # Wrapper drag & resize
│   │   │   ├── TotemFrame.tsx    # Frame visual do totem
│   │   │   ├── ZoneGuides.tsx    # Guias de zona no canvas
│   │   │   ├── AIGenerateDialog.tsx # Geração via IA
│   │   │   ├── HTMLImportDialog.tsx # Importação de HTML
│   │   │   ├── SVGImportDialog.tsx # Importação de SVG
│   │   │   ├── SavedLayoutsDialog.tsx # Layouts salvos
│   │   │   ├── FreeFormTemplatePicker.tsx # Seletor de templates
│   │   │   ├── ThemePalettes.tsx # Paletas de temas
│   │   │   ├── ViewsManager.tsx  # Gerenciador de views/páginas
│   │   │   ├── renderers/        # Renderizadores por tipo de elemento
│   │   │   │   ├── ElementRenderer.tsx # Router de renderização
│   │   │   │   └── ... (27+ renderers)
│   │   │   └── properties/       # Painéis de propriedades específicos
│   │   │       └── ... (12+ painéis)
│   │   ├── components/           # Blocos do editor craft.js (legado)
│   │   ├── settings/             # Settings dos blocos craft.js
│   │   ├── hooks/useHistory.ts   # Undo/Redo
│   │   ├── templates/            # Templates pré-definidos
│   │   ├── types/canvas.ts       # Tipos, defaults e reducer
│   │   └── utils/
│   │       ├── canvasToHtml.ts   # Converte canvas → HTML estático
│   │       ├── htmlToCanvas.ts   # Importa HTML → elementos do canvas
│   │       ├── svgToCanvas.ts    # Importa SVG → elementos do canvas
│   │       ├── htmlEditableFields.ts # Aplica overrides em HTML
│   │       └── editorStorage.ts  # Persistência local (craft.js)
│   ├── components/
│   │   ├── layout/               # DashboardLayout, Sidebar
│   │   ├── devices/              # Componentes de dispositivos
│   │   ├── dashboard/            # Dashboards por papel
│   │   ├── page-builder/         # Componentes auxiliares do builder
│   │   ├── skeletons/            # Loading skeletons
│   │   ├── auth/                 # SocialLogin
│   │   └── ui/                   # shadcn/ui components
│   ├── types/
│   │   └── database.ts           # Tipos locais (Device, Org, etc.)
│   └── integrations/
│       └── supabase/
│           ├── client.ts         # Cliente Supabase (auto-gerado)
│           └── types.ts          # Tipos do banco (auto-gerado)
│
├── public/
│   ├── sync-worker.js            # Worker de sincronização (v6.0+)
│   ├── .env.sync.example         # Exemplo de .env para o sync worker
│   ├── models/                   # Modelos 3D (avatar.glb, animations.glb)
│   ├── templates/                # Templates HTML estáticos
│   └── images/                   # Imagens estáticas
│
├── supabase/
│   ├── config.toml               # Configuração das Edge Functions
│   ├── migrations/               # Migrações SQL (auto-gerado)
│   └── functions/                # Edge Functions
│       ├── totem-html/           # Serve HTML publicado (com ETag)
│       ├── totem-config/         # Configuração unificada do totem
│       ├── totem-heartbeat/      # Heartbeat + comandos pendentes
│       ├── totem-register/       # Registro de novos dispositivos
│       ├── totem-chat/           # Chat IA via Lovable AI Gateway
│       ├── totem-poll-command/   # Polling de comandos
│       ├── totem-command-report/ # Report de execução de comandos
│       ├── ai-config/            # Configuração de IA dedicada
│       ├── manage-users/         # CRUD de usuários (admin)
│       ├── generate-html/        # Geração de HTML via IA
│       └── form-submit/          # Recebimento de formulários do totem
```

---

## 5. Sistema de Autenticação e Autorização

### 5.1 Papéis (Roles)

| Papel | Permissões |
|-------|------------|
| **`super_admin`** | Acesso total: todas organizações, dispositivos, usuários, configs de IA, configurações |
| **`org_admin`** | Acesso restrito à sua organização: seus dispositivos, Page Builder |

### 5.2 Fluxo de Auth

1. Login via email/senha → Supabase Auth
2. `AuthProvider` (useAuth.tsx) gerencia estado global
3. Após login, busca `profiles` (org_id) e `user_roles` (role)
4. Rotas protegidas via `DashboardLayout`
5. Páginas restritas redirecionam para `/dashboard` se sem permissão

### 5.3 Visibilidade por Papel

| Página | Super Admin | Org Admin |
|--------|:-----------:|:---------:|
| Monitor ao Vivo | ✅ | ✅ |
| Dispositivos | ✅ (todos) | ✅ (da org) |
| Page Builder | ✅ | ✅ |
| Configurações IA | ✅ | ❌ |
| Organizações | ✅ | ❌ |
| Usuários | ✅ | ❌ |
| Configurações | ✅ | ❌ |

### 5.4 Row Level Security (RLS)

Todas as tabelas possuem RLS ativado com políticas:
- **Super Admin:** acesso total (via função `has_role()`)
- **Org Admin:** acesso apenas a dados da sua org (via função `get_user_org_id()`)

---

## 6. Banco de Dados — Documentação Detalhada

### 6.1 Diagrama de Relacionamentos (ERD)

```
┌──────────────────┐       ┌──────────────────┐
│  organizations   │◄──────│    profiles       │
│──────────────────│  FK   │──────────────────│
│ id (PK, UUID)    │ org_id│ id (PK, UUID)    │ ← auth.users.id
│ name (TEXT)      │       │ full_name (TEXT)  │
│ slug (TEXT)      │       │ email (TEXT)      │
│ created_at       │       │ org_id (FK, UUID) │
│ updated_at       │       │ created_at        │
└───────┬──────────┘       │ updated_at        │
        │                  └──────────────────┘
        │ FK org_id
        │                  ┌──────────────────┐
        │                  │   user_roles      │
        │                  │──────────────────│
        │                  │ id (PK, UUID)    │
        │                  │ user_id (UUID)   │ ← auth.users.id
        │                  │ role (ENUM)      │   super_admin | org_admin
        │                  └──────────────────┘
        │
┌───────▼──────────┐       ┌──────────────────┐
│     devices      │◄──────│ device_versions  │
│──────────────────│  FK   │──────────────────│
│ id (PK, UUID)    │device │ id (PK, UUID)    │
│ org_id (FK)      │ _id   │ device_id (FK)   │
│ name (TEXT)      │       │ model_url (TEXT)  │
│ api_key (UUID)   │       │ version_notes    │
│ hardware_id (TEXT)│      │ file_name, size  │
│ last_ping (TS)   │       │ created_at       │
│ ui_config (JSONB)│       └──────────────────┘
│ published_html   │
│ avatar_config    │       ┌──────────────────┐
│ ai_prompt (TEXT)  │◄──────│  command_logs    │
│ pending_command   │ FK   │──────────────────│
│ command_sent_at   │device │ id (PK, UUID)    │
│ status_details    │ _id   │ device_id (FK)   │
│ is_speaking       │      │ command (TEXT)    │
│ model_3d_url      │      │ sent_by (UUID)   │
│ created/updated   │      │ status (TEXT)     │
└───────┬──────────┘       │ sent_at / exec_at│
        │                  └──────────────────┘
        │ FK org_id / device_id
        │
┌───────▼──────────┐       ┌──────────────────┐
│   ai_configs     │       │ form_submissions │
│──────────────────│       │──────────────────│
│ id (PK, UUID)    │       │ id (PK, UUID)    │
│ org_id (FK)      │       │ device_id (FK)   │
│ device_id (FK)   │       │ org_id (FK)      │
│ name (VARCHAR)   │       │ form_title (TEXT) │
│ system_prompt    │       │ fields (JSONB)    │
│ knowledge_base   │       │ ip_address       │
│ model, voice ... │       │ metadata (JSONB)  │
│ is_active (BOOL) │       │ submitted_at     │
└──────────────────┘       └──────────────────┘

                           ┌──────────────────┐
                           │ layout_templates │
                           │──────────────────│
                           │ id (PK, UUID)    │
                           │ org_id (FK)      │
                           │ created_by (UUID)│
                           │ name (TEXT)      │
                           │ layout (JSONB)   │
                           │ icon, description│
                           │ created_at       │
                           └──────────────────┘
```

### 6.2 Tabelas — Descrição Detalhada

---

#### 🏢 `organizations` — Organizações (Multi-Tenant)

Tabela raiz do modelo multi-tenant. Toda entidade (devices, users, configs) pertence a uma organização.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador único |
| `name` | TEXT | ❌ | — | Nome da organização (ex: "Shopping Porto Futuro") |
| `slug` | TEXT | ❌ | — | Identificador URL-friendly (ex: "porto-futuro") |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Data de criação |
| `updated_at` | TIMESTAMPTZ | ❌ | `now()` | Data de última atualização |

**RLS:**
- Super Admin: leitura/escrita total
- Org Admin: somente leitura da sua organização (`id = get_user_org_id(auth.uid())`)

---

#### 👤 `profiles` — Perfis de Usuários

Espelho dos dados do `auth.users` no schema público. Criado automaticamente via trigger `handle_new_user()` quando um novo usuário se cadastra.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | — | Mesmo UUID do `auth.users.id` |
| `full_name` | TEXT | ✅ | — | Nome completo do usuário |
| `email` | TEXT | ✅ | — | Email (copiado do auth) |
| `org_id` | UUID (FK) | ✅ | — | Organização vinculada |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Data de criação |
| `updated_at` | TIMESTAMPTZ | ❌ | `now()` | Data de atualização |

**RLS:**
- Super Admin: leitura e exclusão total
- Usuário: leitura e atualização apenas do próprio perfil
- **Sem INSERT público** — criado apenas via trigger no `auth.users`

**⚠️ Importante:** Nunca fazer FK diretamente para `auth.users` em outras tabelas. Use `profiles.id` como referência indireta.

---

#### 🔐 `user_roles` — Papéis de Acesso

Tabela separada para armazenar papéis, evitando escalação de privilégios.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador |
| `user_id` | UUID | ❌ | — | Referência ao usuário |
| `role` | ENUM `app_role` | ❌ | — | `super_admin` ou `org_admin` |

**Constraint:** `UNIQUE (user_id, role)` — um usuário não pode ter o mesmo papel duplicado.

**RLS:**
- Super Admin: CRUD total
- Usuário: somente leitura das próprias roles

---

#### 📱 `devices` — Dispositivos (Totens)

Tabela central do sistema. Cada registro representa um totem físico.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador do dispositivo |
| `org_id` | UUID (FK) | ❌ | — | Organização dona do totem |
| `name` | TEXT | ❌ | — | Nome do dispositivo (ex: "Totem Recepção") |
| `description` | TEXT | ✅ | — | Descrição opcional |
| `location` | TEXT | ✅ | — | Localização física (ex: "Lobby Principal") |
| `api_key` | UUID | ❌ | `gen_random_uuid()` | **Chave de autenticação do hardware** — usada em headers HTTP |
| `hardware_id` | TEXT | ✅ | — | Fingerprint do hardware (hostname) para auto-registro |
| `last_ping` | TIMESTAMPTZ | ✅ | — | Último heartbeat recebido. **Online se < 90s** |
| `ui_config` | JSONB | ✅ | _default UI_ | Estado completo do canvas (JSON com `free_canvas`, views, etc.) |
| `published_html` | TEXT | ✅ | — | **HTML estático gerado pelo Page Builder** — servido ao hardware |
| `ai_prompt` | TEXT | ✅ | — | Prompt de IA legado (campo simples) |
| `avatar_config` | JSONB | ✅ | _default colors_ | Configuração do avatar 3D (cores, material, animação) |
| `pending_command` | TEXT | ✅ | — | Comando pendente: `restart`, `sync`, `reload`, `reload_config` |
| `command_sent_at` | TIMESTAMPTZ | ✅ | — | Quando o comando foi enviado |
| `status_details` | JSONB | ✅ | `{}` | Telemetria: `worker_version`, `http_port`, `uptime_seconds`, `cpu_usage`, `memory_usage` |
| `is_speaking` | BOOLEAN | ✅ | `false` | Se o avatar está reproduzindo fala |
| `last_interaction` | TIMESTAMPTZ | ✅ | — | Última interação do visitante no totem |
| `model_3d_url` | TEXT | ✅ | — | URL do modelo 3D customizado (storage) |
| `current_version_id` | UUID (FK) | ✅ | — | Versão ativa do modelo 3D |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Data de criação |
| `updated_at` | TIMESTAMPTZ | ❌ | `now()` | Data de atualização — **usada como ETag para sincronização** |

**Campos-chave para sincronização:**
- `api_key` → identifica o hardware nas Edge Functions
- `published_html` → HTML que o worker baixa e exibe
- `updated_at` → usado como ETag para cache (polling eficiente)
- `pending_command` → fila de comandos remotos (consumido pelo hardware)
- `last_ping` → indica se o totem está online (< 90s)

**RLS:**
- Super Admin: CRUD total
- Org Admin: CRUD apenas dos devices da sua organização

---

#### 🤖 `ai_configs` — Configurações de IA

Configurações de LLM/TTS por organização ou por dispositivo específico.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador |
| `org_id` | UUID (FK) | ❌ | — | Organização |
| `device_id` | UUID (FK) | ✅ | — | Dispositivo específico. **NULL = config global da org** |
| `name` | VARCHAR | ❌ | 'Configuração Padrão' | Nome descritivo |
| `system_prompt` | TEXT | ❌ | — | Prompt de sistema do LLM |
| `knowledge_base` | TEXT | ❌ | `''` | Base de conhecimento contextual |
| `model` | VARCHAR | ❌ | 'llama3.2:1b' | Modelo LLM |
| `temperature` | NUMERIC | ✅ | 0.3 | Temperatura (criatividade) |
| `max_tokens` | INTEGER | ✅ | 50 | Limite de tokens |
| `voice` | VARCHAR | ✅ | 'af_bella' | Voz TTS |
| `tts_model` | VARCHAR | ✅ | 'kokoro' | Engine TTS |
| `tts_speed` | NUMERIC | ✅ | 1 | Velocidade da fala |
| `avatar_name` | VARCHAR | ✅ | 'Assistente' | Nome do avatar |
| `base_url` | TEXT | ✅ | — | URL base do servidor local |
| `llm_url` / `tts_url` / `stt_url` | TEXT | ✅ | — | URLs de serviços locais |
| `is_active` | BOOLEAN | ✅ | `true` | Configuração ativa |

**Hierarquia de precedência:**
```
1. ai_configs WHERE device_id = <device> → Mais específica
2. ai_configs WHERE org_id = <org> AND device_id IS NULL → Global da org
3. devices.ai_prompt → Legado (campo simples)
4. Prompt hardcoded → Fallback final
```

---

#### 📋 `command_logs` — Auditoria de Comandos Remotos

Rastreia o ciclo de vida completo de cada comando enviado do Hub para o hardware.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador |
| `device_id` | UUID (FK) | ❌ | — | Dispositivo alvo |
| `command` | TEXT | ❌ | — | Comando: `restart`, `sync`, `reload`, `reload_config` |
| `sent_by` | UUID | ❌ | — | Usuário que disparou o comando |
| `status` | TEXT | ❌ | 'pending' | Estado: `pending` → `delivered` → `executed` / `failed` |
| `sent_at` | TIMESTAMPTZ | ❌ | `now()` | Quando foi enviado |
| `executed_at` | TIMESTAMPTZ | ✅ | — | Quando foi executado no hardware |

**Ciclo de vida:**
```
pending → (hardware faz poll) → delivered → (hardware executa) → executed | failed
```

---

#### 📦 `device_versions` — Histórico de Modelos 3D

Versões de modelos 3D enviados via upload para cada dispositivo.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador |
| `device_id` | UUID (FK) | ❌ | — | Dispositivo |
| `model_url` | TEXT | ❌ | — | URL no storage (bucket `models`) |
| `version_notes` | TEXT | ✅ | — | Notas da versão |
| `file_name` | TEXT | ✅ | — | Nome do arquivo original |
| `file_size` | BIGINT | ✅ | — | Tamanho em bytes |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Data de upload |

---

#### 📝 `form_submissions` — Formulários do Totem

Dados preenchidos por visitantes nos formulários exibidos no totem.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador |
| `device_id` | UUID (FK) | ✅ | — | Dispositivo de origem |
| `org_id` | UUID (FK) | ✅ | — | Organização |
| `form_title` | TEXT | ✅ | — | Título do formulário |
| `fields` | JSONB | ❌ | `{}` | Dados dos campos preenchidos |
| `ip_address` | TEXT | ✅ | — | IP do visitante |
| `metadata` | JSONB | ✅ | `{}` | Metadados adicionais |
| `submitted_at` | TIMESTAMPTZ | ❌ | `now()` | Data de envio |

**RLS:** INSERT público (qualquer um pode enviar), SELECT restrito a admins da org.

---

#### 🎨 `layout_templates` — Templates de Layout Salvos

Layouts do Page Builder salvos como templates reutilizáveis por organização.

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID (PK) | ❌ | `gen_random_uuid()` | Identificador |
| `org_id` | UUID (FK) | ❌ | — | Organização |
| `created_by` | UUID | ❌ | — | Usuário que criou |
| `name` | TEXT | ❌ | — | Nome do template |
| `icon` | TEXT | ❌ | '🎨' | Emoji ícone |
| `description` | TEXT | ✅ | — | Descrição |
| `layout` | JSONB | ❌ | — | Estado completo do canvas (JSON) |
| `created_at` | TIMESTAMPTZ | ❌ | `now()` | Data de criação |

### 6.3 Funções SQL

| Função | Tipo | Descrição |
|--------|------|-----------|
| `get_user_org_id(user_id UUID)` | SECURITY DEFINER | Retorna `org_id` do perfil do usuário. Usada em todas as políticas RLS de org_admin |
| `has_role(user_id UUID, role app_role)` | SECURITY DEFINER | Verifica se o usuário possui determinado papel. Usada em todas as políticas RLS de super_admin |
| `handle_new_user()` | TRIGGER (SECURITY DEFINER) | Cria automaticamente um registro em `profiles` quando um novo usuário é criado no `auth.users` |
| `update_updated_at_column()` | TRIGGER | Atualiza `updated_at = now()` automaticamente em UPDATEs |

### 6.4 Enums

```sql
CREATE TYPE public.app_role AS ENUM ('super_admin', 'org_admin');
```

### 6.5 Storage (Buckets)

| Bucket | Público | Uso |
|--------|---------|-----|
| `models` | ✅ | Modelos 3D (.glb) dos avatares |
| `logos` | ✅ | Logos das organizações |
| `canvas-images` | ✅ | Imagens usadas no Page Builder |

---

## 7. Edge Functions (Backend)

### 7.1 `totem-html` ⭐ NOVO
**Propósito:** Serve o HTML publicado de um dispositivo para o sync worker.

| Campo | Detalhes |
|-------|---------|
| **Método** | GET |
| **Auth** | Header `x-totem-api-key` ou `x-totem-device-id` |
| **Resposta** | HTML completo (text/html) |
| **Cache** | ETag baseado em `updated_at`; retorna `304 Not Modified` se inalterado |
| **Fallback** | Página "Aguardando publicação..." se `published_html` está vazio |

### 7.2 `totem-config`
**Propósito:** Fornece configuração unificada (UI + IA) para o hardware em uma única requisição.

| Campo | Detalhes |
|-------|---------|
| **Método** | GET |
| **Auth** | Header `x-totem-api-key` |
| **Resposta** | `{ config: { device_id, device_name, organization, avatar, model, ui, ai } }` |

### 7.3 `totem-heartbeat`
**Propósito:** Registra que o dispositivo está ativo e retorna comandos pendentes.

| Campo | Detalhes |
|-------|---------|
| **Método** | POST |
| **Auth** | Header `x-totem-api-key` |
| **Body** | `{ status_details, is_speaking }` |
| **Resposta** | `{ device_id, config, command, model_url }` |

**Efeitos colaterais:**
- Atualiza `last_ping`, `status_details`, `is_speaking`
- Retorna e limpa `pending_command`
- Marca comando como executado no `command_logs`

### 7.4 `totem-chat`
**Propósito:** Chat por IA usando Lovable AI Gateway (Gemini 3 Flash) como fallback cloud.

| Campo | Detalhes |
|-------|---------|
| **Método** | POST |
| **Auth** | Nenhuma (ou `x-totem-api-key`) |
| **Body** | `{ messages: [{role, content}], device_id }` |
| **Resposta** | SSE stream (Server-Sent Events) |

### 7.5 `totem-register`
**Propósito:** Registra um novo dispositivo via Dashboard.

| Campo | Detalhes |
|-------|---------|
| **Método** | POST |
| **Auth** | Bearer token (usuário logado) |
| **Body** | `{ name, description, location, org_id }` |
| **Verificação** | Super Admin pode criar em qualquer org; Org Admin apenas na sua |

### 7.6 `totem-poll-command`
**Propósito:** Polling de comandos pendentes pelo hardware.

### 7.7 `totem-command-report`
**Propósito:** Report de execução de comandos pelo hardware.

### 7.8 `ai-config`
**Propósito:** Endpoint dedicado para buscar apenas config de IA (usado pelo hardware local).

| Campo | Detalhes |
|-------|---------|
| **Método** | GET |
| **Auth** | Header `x-totem-api-key` |
| **Resposta** | `{ config: { system_prompt, knowledge_base, model, voice, ... } }` |

### 7.9 `manage-users`
**Propósito:** CRUD de usuários (apenas Super Admin).

| Ação | Descrição |
|------|-----------|
| `list` | Lista todos os perfis com roles |
| `invite` | Cria usuário com senha aleatória e atribui org + role |
| `update` | Atualiza org_id, role ou full_name |
| `delete` | Remove user_roles, profiles e auth.users |

### 7.10 `generate-html`
**Propósito:** Gera HTML via IA para uso no Page Builder.

### 7.11 `form-submit`
**Propósito:** Recebe dados de formulários preenchidos nos totens e salva na tabela `form_submissions`.

---

## 8. Páginas do Dashboard (Frontend)

### 8.1 `/auth` — Autenticação
Login e signup com email/senha.

### 8.2 `/dashboard` — Monitor ao Vivo
- **Super Admin:** `SuperAdminDashboard` com métricas globais
- **Org Admin:** `OrgAdminDashboard` com métricas da organização
- Cards de métricas, gráficos, lista de dispositivos ativos

### 8.3 `/dashboard/devices` — Dispositivos
Lista de todos os dispositivos com:
- Status (online/offline baseado em `last_ping` < 90s)
- Último ping, localização
- Ações: criar novo, editar, excluir

### 8.4 `/dashboard/devices/:deviceId` — Detalhes do Dispositivo
Tabs:
- **🧠 Prompt de IA:** Editor de prompt com salvamento direto
- **📦 Detalhes:** API Key, informações, histórico de comandos, histórico de versões, presets de ambiente

Funcionalidades:
- Edição inline (nome, descrição, localização)
- Reinicialização remota
- Clonagem de dispositivo
- Realtime updates via Supabase Channels

### 8.5 `/dashboard/organizations` — Organizações
Hierarquia visual com Cards + Accordion:
- Cada organização é um card expansível
- Ao expandir, lista dispositivos com status, localização e ações
- Métricas: total de orgs, dispositivos, usuários, taxa de disponibilidade
- Busca unificada por org ou dispositivo
- CRUD de organizações

### 8.6 `/dashboard/users` — Usuários
- Tabela com nome, email, organização, função, data de criação
- Convidar novo usuário (cria conta via Edge Function)
- Edição inline de organização e role
- Exclusão de usuários

### 8.7 `/dashboard/ai-configs` — Configurações de IA
Cards com configurações de IA:
- Vinculação a organização e/ou dispositivo
- Templates prontos (Loja, Hospital, Hotel, Corporativo, Porto Futuro)
- Parâmetros: system prompt, knowledge base, modelo, temperatura, max tokens
- Configuração de voz: engine TTS, voz, velocidade
- URLs de serviços locais (LLM, TTS, STT)
- Toggle ativo/inativo

### 8.8 `/dashboard/settings` — Configurações
- Perfil do usuário (nome, email)
- Chaves de API (URL da API, Anon Key)
- Documentação de endpoints
- Configurações de notificações

### 8.9 `/dashboard/page-editor` — Page Builder
Editor visual de canvas livre com:
- Seletor de dispositivo no topo
- Salvamento no banco de dados (`ui_config`)
- Publicação de HTML estático (`published_html`)
- Botão de limpar canvas

---

## 9. Page Builder (Editor de Canvas)

### 9.1 Conceito
Editor tipo **Figma/Canva** com canvas fixo de **1080×1920px** (resolução vertical de totem). Elementos são posicionados livremente com drag & drop (react-rnd).

### 9.2 Elementos Suportados (27+ tipos)

| Tipo | Descrição |
|------|-----------|
| `text` | Texto com formatação e interpolação `{{var}}` |
| `image` | Imagens (URL ou upload) |
| `button` | Botões interativos com ações (prompt, URL, navigate) |
| `shape` | Formas geométricas (retângulo, círculo) |
| `icon` | Ícones (emoji) |
| `video` | Embed de vídeo |
| `carousel` | Carrossel de imagens |
| `gallery` | Grid de galeria |
| `qrcode` | QR Codes dinâmicos |
| `qrpix` | QR Code Pix para pagamentos |
| `social` | Links de redes sociais |
| `clock` | Relógio digital |
| `weather` | Widget de clima |
| `countdown` | Contador regressivo |
| `animated-number` | Número com animação de incremento |
| `chat` | Interface de chat IA integrada |
| `map` | Mapas embarcados |
| `iframe` | iFrames genéricos |
| `store` | Diretório de lojas |
| `catalog` | Grid de produtos com filtro |
| `list` | Lista/menu de itens |
| `feed` | Feed de lojas com cards |
| `form` | Formulários dinâmicos |
| `bigcta` | CTA grande com pulso |
| `ticket` | Painel de senhas |
| `numpad` | Teclado numérico |
| `avatar` | Avatar 3D |

### 9.3 Sistema de Páginas (Views)

O editor suporta múltiplas páginas internas:
- Cada elemento é atribuído a uma `viewId`
- Navegação entre páginas via `actionType: 'navigate'` nos botões
- Transições animadas: `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `zoom`, `flip`, `rotate`
- Idle timeout configurável retorna à página padrão
- Fundo independente por página (`pageBgColors`)

### 9.4 Variáveis de Página

O `PageVariablesContext` permite interpolação de texto em tempo real:
- Sintaxe `{{variavel}}` no `TextRenderer`
- Dados capturados em formulários, listas e catálogos são injetados automaticamente
- `targetVariable` mapeia itens selecionados para campos em outras páginas

### 9.5 Fluxo de Salvamento e Publicação

```
Hub (Page Builder)
  │
  ├── Salvar → UPDATE devices.ui_config (estado do canvas em JSON)
  │
  ├── Publicar → canvasToHtml() gera HTML autônomo
  │            → UPDATE devices.published_html (HTML estático)
  │            → UPDATE devices.updated_at (trigger de nova versão)
  │
  └── Hardware recebe por:
       └── Sync Worker polling totem-html (15s)
           → Compara ETag (updated_at timestamp)
           → 304: sem mudança / 200: novo HTML
           → Salva index.html local
           → Live reload via /__totem_version
```

### 9.6 Escala de Visualização
Seletor de largura (320px a 720px) para visualizar o canvas em diferentes resoluções de monitor, mantendo a proporção 1080×1920.

### 9.7 Funcionalidades Adicionais
- **Undo/Redo** com histórico de ações
- **Templates pré-definidos** para cenários comuns
- **Importação de HTML** e **SVG**
- **Geração via IA** (AIGenerateDialog)
- **Layouts salvos** por organização (tabela `layout_templates`)
- **Temas/Paletas** de cores
- **Guias de zona** no canvas
- **Limpar tudo** (reset do canvas)
- **Exportar/Importar JSON** do estado do canvas

---

## 10. Sincronização com Hardware (Totem) — Guia Completo

### 10.1 Visão Geral da Arquitetura de Sincronização

O sistema utiliza uma arquitetura de **HTML estático com polling baseado em ETag**. O Hub (dashboard web) gera HTML autônomo e o armazena no banco de dados. O hardware local (sync-worker) periodicamente verifica se há atualizações e baixa o novo HTML quando disponível.

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUXO DE SINCRONIZAÇÃO                        │
│                                                                  │
│  ┌─────────────┐    Publica HTML     ┌──────────────────────┐   │
│  │  Page Builder │ ──────────────────► │  devices.published_  │   │
│  │  (Hub Web)   │                     │  html + updated_at   │   │
│  └─────────────┘                     └──────────┬───────────┘   │
│                                                  │               │
│                    Edge Function                 │               │
│                    totem-html                    │               │
│                    (GET + ETag)                  │               │
│                                                  │               │
│  ┌─────────────────┐    Polling 15s    ┌────────▼──────────┐   │
│  │  Sync Worker     │ ◄───────────────── │  Lovable Cloud    │   │
│  │  (Node.js local) │    304 | 200+HTML  │  (Backend)        │   │
│  └────────┬────────┘                    └──────────────────┘   │
│           │                                                     │
│           │  Salva index.html                                   │
│           │  Live reload (4s check)                             │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │  Navegador Kiosk │                                           │
│  │  (Chromium/Edge) │                                           │
│  │  localhost:8080   │                                           │
│  └─────────────────┘                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 10.2 Como Funciona Passo a Passo

#### Fase 1: Publicação (Hub → Banco de Dados)

1. Admin abre o **Page Builder** e seleciona um dispositivo
2. Edita o layout no canvas (1080×1920px)
3. Clica em **"Publicar"**
4. `canvasToHtml()` converte o canvas em HTML/CSS autônomo
5. O HTML é salvo em `devices.published_html` (coluna TEXT)
6. `devices.updated_at` é atualizado automaticamente (usado como ETag)

#### Fase 2: Detecção de Atualização (Hardware → Cloud)

7. O Sync Worker faz polling a cada **15 segundos** na Edge Function `totem-html`
8. O request inclui:
   - Header `x-totem-api-key: <api_key>` (identifica o dispositivo)
   - Header `If-None-Match: "<timestamp>"` (ETag da última versão conhecida)
9. A Edge Function compara o ETag:
   - **Se igual:** Retorna `304 Not Modified` (sem corpo, economiza banda)
   - **Se diferente:** Retorna `200` com o HTML completo e novo ETag

#### Fase 3: Atualização Local (Worker → Navegador)

10. Worker recebe o novo HTML e salva como `index.html` local
11. Injeta script de **auto-reload** no HTML (se não existir)
12. Incrementa o `htmlRevision` interno
13. O navegador kiosk verifica `/__totem_version` a cada **4 segundos**
14. Detecta que `revision` mudou → **recarrega a página automaticamente**

#### Fase 4: Heartbeat (Hardware → Cloud)

15. Worker envia heartbeat a cada **30 segundos** via `totem-heartbeat`
16. Payload inclui: `worker_version`, `http_port`, `uptime_seconds`
17. Cloud atualiza `devices.last_ping` → Dashboard mostra status online
18. Se há `pending_command`, o heartbeat retorna o comando

### 10.3 Protocolo de Comunicação

| Endpoint | Método | Frequência | Header de Auth | Função |
|----------|--------|------------|----------------|--------|
| `totem-html` | GET | 15s | `x-totem-api-key` | Busca HTML publicado (com ETag) |
| `totem-heartbeat` | POST | 30s | `x-totem-api-key` | Registra status online + telemetria |
| `totem-poll-command` | GET | 5s | `x-totem-api-key` | Verifica comandos pendentes |
| `totem-command-report` | POST | On-demand | `x-totem-api-key` | Reporta resultado de comando |
| `totem-config` | GET | On-demand | `x-totem-api-key` | Config unificada (UI + IA) |
| `ai-config` | GET | On-demand | `x-totem-api-key` | Apenas config de IA |

### 10.4 Sync Worker (`public/sync-worker.js`) — v7.0

Script Node.js autônomo com as seguintes responsabilidades:

| Componente | Descrição |
|------------|-----------|
| **Servidor HTTP** | Serve `index.html` na porta 8080 com endpoints de health e versão |
| **Polling de HTML** | Verifica `totem-html` a cada 15s usando ETags |
| **Heartbeat** | Envia status a cada 30s via `totem-heartbeat` |
| **Comandos Remotos** | Polling de comandos a cada 5s via `totem-poll-command` |
| **Kiosk Manager** | Auto-detecta e abre Chromium/Chrome/Edge em modo kiosk |
| **Live Reload** | Injeta script que recarrega o navegador automaticamente |
| **Supervisor** | Reinicia automaticamente em caso de crash (até 10x em 60s) |
| **Backup** | Cria `.bak` do HTML antes de sobrescrever |

### 10.5 ⭐ GUIA: Configurar uma Máquina Nova

#### Pré-requisitos
- **Node.js** 18+ instalado
- **Chromium, Chrome ou Edge** instalado
- Acesso à internet

#### Passo 1: Criar o Dispositivo no Hub

1. Acesse o Dashboard → **Dispositivos** → **"Novo Dispositivo"**
2. Preencha: Nome, Descrição, Localização, Organização
3. O sistema gera automaticamente:
   - `id` (UUID do dispositivo)
   - `api_key` (UUID de autenticação)
4. **Copie a API Key** — você vai precisar dela no próximo passo

#### Passo 2: Preparar o Diretório no Hardware

```bash
# Crie uma pasta para o totem
mkdir ~/totem
cd ~/totem

# Baixe o sync-worker.js do projeto publicado
curl -o sync-worker.js https://aitimanager.lovable.app/sync-worker.js
```

#### Passo 3: Criar o Arquivo `.env`

Crie um arquivo `.env` no mesmo diretório do `sync-worker.js`:

```env
# ══════════════════════════════════════════════════════════
#  CONFIGURAÇÃO DO TOTEM — Obrigatório
# ══════════════════════════════════════════════════════════

# URL base do Supabase (NÃO ALTERE)
VITE_SUPABASE_URL=https://iwqcltmeniotzbowbxzg.supabase.co

# Anon Key do projeto (NÃO ALTERE)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cWNsdG1lbmlvdHpib3dieHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQ0NDUsImV4cCI6MjA4NzAyMDQ0NX0.IxBMzeC6VUhe8lRE0yELuZM-4YdzgBo5dsCdddp1C_s

# ★ COLE AQUI a API Key do dispositivo (copiada do Hub)
API_KEY=cole-a-api-key-aqui

# ══════════════════════════════════════════════════════════
#  CONFIGURAÇÃO OPCIONAL
# ══════════════════════════════════════════════════════════

# Porta do servidor local (padrão: 8080)
HTTP_PORT=8080

# Intervalo de polling em ms (padrão: 15000 = 15s)
SYNC_INTERVAL_MS=15000

# Debug detalhado
VERBOSE=true
```

**⚠️ Mínimo necessário:** Apenas `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `API_KEY`. O worker deriva `VITE_CMS_API_URL` automaticamente da URL do Supabase.

#### Passo 4: Iniciar o Worker

```bash
# Modo completo (servidor + polling + kiosk)
node sync-worker.js

# Sem abrir navegador (para testar em background)
node sync-worker.js --no-kiosk

# Apenas setup inicial (baixa HTML e sai)
node sync-worker.js --setup
```

#### Passo 5: Verificar que Está Funcionando

Após iniciar, você deve ver no terminal:

```
╔══════════════════════════════════════════════════╗
║         TOTEM WORKER  v7.0.0                     ║
║         HTTP Server + HTML Updater + Auto-Restart ║
╚══════════════════════════════════════════════════╝

[Totem] ✅ .env encontrado
[Totem] API URL      : https://xxx.supabase.co/functions/v1
[Totem] Device ID    : (via API key)
[Totem] HTTP Port    : 8080
[Totem] Intervalo    : 15s
[Totem] 🌐 Servidor HTTP em http://localhost:8080
[Totem] ✅ HTML atualizado (42.3 KB)
[Totem] 💓 Heartbeat ativo (a cada 30s)
```

**No Hub (Dashboard):**
- O dispositivo deve aparecer como **🟢 Online** em poucos segundos
- A coluna "Último Ping" mostra o tempo decorrido

#### Passo 6: Publicar um Layout

1. No Hub, vá em **Page Builder** → selecione o dispositivo
2. Crie ou importe um layout
3. Clique em **"Publicar"**
4. Em até **15 segundos**, o totem atualiza automaticamente

#### Passo 7 (Opcional): Configurar Inicialização Automática

**Linux (systemd):**
```ini
[Unit]
Description=Totem Sync Worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=totem
WorkingDirectory=/home/totem/totem
ExecStart=/usr/bin/node sync-worker.js
Restart=always
RestartSec=10
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target
```

**Windows (Task Scheduler):**
- Programa: `node.exe`
- Argumentos: `C:\totem\sync-worker.js`
- Trigger: "Ao fazer logon"
- Marcar: "Executar com privilégios máximos"

### 10.6 Comandos Remotos

Enviados pelo Hub e consumidos pelo worker via polling (5s):

| Comando | Ação no Worker | Uso |
|---------|---------------|-----|
| `sync` | Limpa ETag e força download do HTML | Após publicar layout |
| `reload` | Mesmo que `sync` | Recarregar página |
| `reload_config` | Mesmo que `sync` | Após alterar config de IA |
| `restart` | `process.exit(75)` → supervisor reinicia | Problemas no worker |

**Ciclo de um comando:**
```
Hub: INSERT command_logs (status='pending')
Hub: UPDATE devices SET pending_command='sync'
  ↓ (5s polling)
Worker: GET totem-poll-command → recebe 'sync'
Worker: Executa o comando
Worker: POST totem-command-report (status='executed' ou 'failed')
Cloud: UPDATE command_logs SET status='executed', executed_at=now()
Cloud: UPDATE devices SET pending_command=NULL
```

### 10.7 Live Reload — Como Funciona

O worker injeta um script no `index.html` servido que monitora mudanças:

```
Worker:                              Navegador Kiosk:
┌─────────────────┐                 ┌─────────────────┐
│ htmlRevision = 1 │                 │ GET /__totem_    │
│                  │ ←──── 4s ────── │ version          │
│ Responde:        │                 │ last = 1         │
│ { revision: 1 }  │                 │ (sem mudança)    │
│                  │                 │                  │
│ ... novo HTML    │                 │                  │
│ htmlRevision = 2 │                 │                  │
│                  │ ←──── 4s ────── │ GET /__totem_    │
│ Responde:        │                 │ version          │
│ { revision: 2 }  │                 │ last ≠ 2         │
│                  │                 │ → RELOAD!        │
└─────────────────┘                 └─────────────────┘
```

### 10.8 Resolução de Problemas

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Totem mostra "Aguardando publicação..." | Nenhum layout foi publicado | Publique um layout no Page Builder |
| Totem offline no Dashboard | Worker não está rodando ou sem internet | Verifique o processo e a conexão |
| HTML não atualiza | ETag travado ou erro de rede | Envie comando `sync` pelo Hub |
| Worker crashando em loop | Erro de configuração no `.env` | Verifique `API_KEY` e URLs |
| Navegador não abre | Chromium/Chrome não encontrado | Instale ou configure `KIOSK_BROWSER` |
| `401 Unauthorized` | API Key inválida ou expirada | Verifique `API_KEY` no `.env` vs Hub |
| `304` constante mas HTML antigo | Cache local corrompido | Delete `index.html` e reinicie |

### 10.9 Variáveis do Worker (Resumo)

| Variável | Obrigatória | Default | Descrição |
|----------|:-----------:|---------|-----------|
| `VITE_SUPABASE_URL` | ✅ | — | URL base do projeto |
| `VITE_SUPABASE_ANON_KEY` | ✅ | — | Chave pública do projeto |
| `API_KEY` | ✅* | — | API Key do dispositivo |
| `VITE_TOTEM_DEVICE_ID` | ✅* | — | *Alternativa ao API_KEY |
| `VITE_CMS_API_URL` | ❌ | Auto-derivado | URL das Edge Functions |
| `HTTP_PORT` | ❌ | `8080` | Porta do servidor HTTP |
| `SYNC_INTERVAL_MS` | ❌ | `15000` | Intervalo de polling (ms) |
| `KIOSK_URL` | ❌ | `localhost:8080` | URL que o kiosk abre |
| `KIOSK_DELAY_MS` | ❌ | `3000` | Delay antes de abrir kiosk |
| `KIOSK_BROWSER` | ❌ | `auto` | Caminho do navegador |
| `VERBOSE` | ❌ | `false` | Logs detalhados |

*Pelo menos um entre `API_KEY` e `VITE_TOTEM_DEVICE_ID` é obrigatório.

---

## 11. Sistema de IA

### 11.1 Configuração Hierárquica
```
1. Config por device_id (ai_configs) → Mais específica
2. Config por org_id (ai_configs, device_id IS NULL)
3. Campo ai_prompt do device → Legado
4. Prompt padrão hardcoded → Fallback final
```

### 11.2 Parâmetros Configuráveis

| Parâmetro | Default | Descrição |
|-----------|---------|-----------|
| system_prompt | "Você é um assistente..." | Instrução de comportamento |
| knowledge_base | "" | Base de conhecimento contextual |
| model | llama3.2:1b | Modelo LLM (para backend local) |
| temperature | 0.3 | Criatividade das respostas |
| max_tokens | 50 | Limite de tokens por resposta |
| avatar_name | "Assistente" | Nome do avatar |
| voice | af_bella | Voz TTS |
| tts_model | kokoro | Engine TTS |
| tts_speed | 1 | Velocidade da fala |

### 11.3 Templates Pré-definidos
O sistema oferece templates de prompt para cenários comuns:
- 🛍️ Loja / Varejo
- 🏥 Clínica / Hospital
- 🏨 Hotel / Hospitalidade
- 🏢 Escritório / Corporativo
- 🌿 Porto Futuro 2

### 11.4 Chat Cloud (Gemini)
O `totem-chat` utiliza o Lovable AI Gateway com Gemini 3 Flash para processar mensagens de chat enviadas pelo formulário do totem. O streaming é feito via SSE (Server-Sent Events).

---

## 12. Fluxos Principais

### 12.1 Registro de Novo Dispositivo
1. Super/Org Admin acessa "Dispositivos" → "Novo Dispositivo"
2. Preenche nome, descrição, localização, organização
3. Edge Function `totem-register` cria device com `api_key` gerada automaticamente
4. API Key é exibida para copiar e configurar no `.env` do sync worker

### 12.2 Design e Publicação do Layout
1. Admin acessa **Page Builder** → seleciona dispositivo
2. Arrasta e posiciona elementos no canvas (1080×1920)
3. Configura propriedades de cada elemento
4. **Salvar** → grava `ui_config` (JSON) na tabela `devices`
5. **Publicar** → `canvasToHtml()` gera HTML autônomo → grava em `published_html`
6. Sync Worker detecta nova versão via ETag → baixa HTML → atualiza `index.html` local
7. Live reload do navegador quiosque exibe o novo layout

### 12.3 Configuração de IA
1. Admin acessa "Configurações IA"
2. Cria config vinculada a org e/ou dispositivo
3. Define prompt, knowledge base, modelo, voz
4. Hardware busca config automaticamente via `ai-config` ou `totem-config`

### 12.4 Monitoramento
1. Dashboard mostra métricas em tempo real
2. Dispositivos com `last_ping > 90s` são marcados como offline
3. Comandos podem ser enviados remotamente (restart, reload, sync)
4. Histórico de comandos disponível no detalhe do dispositivo

### 12.5 Formulários do Totem
1. Visitante preenche formulário no totem (elemento `form`)
2. Dados enviados via Edge Function `form-submit`
3. Salvos na tabela `form_submissions` com device_id e org_id

---

## 13. Variáveis de Ambiente

### Hub (Dashboard) — `.env` (auto-gerado)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Sync Worker (Hardware) — `.env`
```env
VITE_CMS_API_URL=https://xxx.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_TOTEM_DEVICE_ID=<uuid-do-dispositivo>
API_KEY=<uuid-da-api-key>
SYNC_INTERVAL_MS=15000
HTTP_PORT=8080
```

### Edge Functions (automático)
```env
SUPABASE_URL        # Auto-configurado
SUPABASE_ANON_KEY   # Auto-configurado
SUPABASE_SERVICE_ROLE_KEY  # Auto-configurado
LOVABLE_API_KEY     # Para Lovable AI Gateway
```

---

> **Nota:** Esta documentação reflete o estado do projeto em março de 2026. Para atualizações, consulte o código-fonte e os comentários inline.
