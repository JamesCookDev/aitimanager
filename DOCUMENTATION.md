# AITI.MANAGER — Documentação Técnica do Projeto

> **Versão:** 5.0.0 | **Última atualização:** 2026-03-13

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

## 6. Banco de Dados

### 6.1 Tabelas

#### `organizations`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | Identificador |
| name | TEXT | Nome da organização |
| slug | TEXT | Identificador URL-friendly |
| created_at / updated_at | TIMESTAMPTZ | Timestamps |

#### `profiles`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | Referência ao auth.users |
| full_name | TEXT | Nome completo |
| email | TEXT | Email |
| org_id | UUID (FK) | Organização vinculada |

#### `user_roles`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | Identificador |
| user_id | UUID | Referência ao usuário |
| role | ENUM | `super_admin` ou `org_admin` |

#### `devices`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | Identificador |
| org_id | UUID (FK) | Organização |
| name | TEXT | Nome do dispositivo |
| description | TEXT | Descrição opcional |
| location | TEXT | Localização física |
| api_key | UUID | Chave de autenticação do hardware |
| hardware_id | TEXT | ID do hardware físico |
| last_ping | TIMESTAMPTZ | Último heartbeat |
| ui_config | JSONB | Configuração de layout (free_canvas) |
| **published_html** | **TEXT** | **HTML estático publicado pelo Page Builder** |
| ai_prompt | TEXT | Prompt de IA legado |
| avatar_config | JSONB | Configuração do avatar 3D |
| pending_command | TEXT | Comando pendente (restart, sync, reload) |
| command_sent_at | TIMESTAMPTZ | Quando o comando foi enviado |
| status_details | JSONB | Detalhes de status (versão, CPU, memória) |
| is_speaking | BOOLEAN | Avatar está falando |
| last_interaction | TIMESTAMPTZ | Última interação do usuário final |
| model_3d_url | TEXT | URL do modelo 3D customizado |
| current_version_id | UUID (FK) | Versão atual do modelo 3D |
| created_at / updated_at | TIMESTAMPTZ | Timestamps |

#### `ai_configs`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | Identificador |
| org_id | UUID (FK) | Organização |
| device_id | UUID (FK, nullable) | Dispositivo específico (null = org-wide) |
| name | VARCHAR | Nome da configuração |
| system_prompt | TEXT | Prompt do sistema |
| knowledge_base | TEXT | Base de conhecimento |
| model | VARCHAR | Modelo LLM (ex: llama3.2:1b) |
| temperature | NUMERIC | Temperatura do modelo |
| max_tokens | INTEGER | Máximo de tokens |
| voice | VARCHAR | Voz TTS (ex: af_bella) |
| tts_model | VARCHAR | Motor TTS (ex: kokoro) |
| tts_speed | NUMERIC | Velocidade da fala |
| avatar_name | VARCHAR | Nome do avatar |
| base_url / llm_url / tts_url / stt_url | TEXT | URLs de serviços locais |
| is_active | BOOLEAN | Configuração ativa |

#### `device_versions`
Histórico de versões de modelo 3D por dispositivo.

#### `command_logs`
Log de comandos enviados aos dispositivos (restart, sync, reload, etc.).

#### `layout_templates`
Templates de layout salvos por organização.

#### `form_submissions`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID (PK) | Identificador |
| device_id | UUID (FK) | Dispositivo de origem |
| org_id | UUID (FK) | Organização |
| form_title | TEXT | Título do formulário |
| fields | JSONB | Dados dos campos preenchidos |
| ip_address | TEXT | IP do visitante |
| metadata | JSONB | Metadados adicionais |
| submitted_at | TIMESTAMPTZ | Data de envio |

### 6.2 Funções SQL

- **`get_user_org_id(user_id)`** → Retorna org_id do usuário
- **`has_role(user_id, role)`** → Verifica se usuário tem determinado papel

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

## 10. Sincronização com Hardware (Totem)

### 10.1 Sync Worker (`public/sync-worker.js`)

O Sync Worker (v6.0+) é um script Node.js autônomo que:

1. **Serve HTML** via HTTP na porta 8080
2. **Faz polling** da Edge Function `totem-html` a cada 15s
3. **Usa ETags** para evitar downloads desnecessários
4. **Gerencia o navegador** em modo quiosque (auto-detecta Chromium/Chrome)
5. **Supervisor embutido** reinicia automaticamente em caso de falha (até 10 vezes em 60s)
6. **Escuta comandos remotos** (restart, reload, sync)

### 10.2 Live Reload

O worker injeta um script no `index.html` local que monitora o endpoint interno `/__totem_version` a cada 4 segundos. Quando o HTML é atualizado, o `htmlRevision` é incrementado, disparando o recarregamento instantâneo do navegador quiosque.

### 10.3 Uso

```bash
# No diretório do hardware
node sync-worker.js              # Servidor + polling + kiosk
node sync-worker.js --no-kiosk   # Sem abrir navegador
node sync-worker.js --setup      # Apenas setup inicial
```

### 10.4 Variáveis do Worker (`.env`)

```env
VITE_CMS_API_URL=https://xxx.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_TOTEM_DEVICE_ID=<uuid-do-dispositivo>
API_KEY=<uuid-da-api-key>
SYNC_INTERVAL_MS=15000
HTTP_PORT=8080
KIOSK_URL=http://localhost:8080
KIOSK_DELAY_MS=3000
KIOSK_BROWSER=<caminho-do-navegador>  # auto-detecta
```

### 10.5 Comandos Remotos

| Comando | Ação |
|---------|------|
| `restart` | Reinicia o processo do totem |
| `sync` | Força sincronização de HTML |
| `reload` | Recarrega a página do totem |

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
