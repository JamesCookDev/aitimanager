# AITI.MANAGER — Documentação Técnica do Projeto

> **Versão:** 4.13.0 | **Última atualização:** 2026-02-22

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
10. [Aplicação Local do Totem (Hardware)](#10-aplicação-local-do-totem-hardware)
11. [Sistema de IA](#11-sistema-de-ia)
12. [Sincronização e Comunicação](#12-sincronização-e-comunicação)
13. [Fluxos Principais](#13-fluxos-principais)
14. [Variáveis de Ambiente](#14-variáveis-de-ambiente)

---

## 1. Visão Geral

O **AITI.MANAGER** é uma plataforma de gerenciamento de totens interativos com avatar 3D e inteligência artificial. O sistema é composto por:

- **Hub (Dashboard Web):** Painel administrativo para gerenciar organizações, dispositivos, configurações de IA e layout visual dos totens.
- **Hardware Local (Totem):** Aplicação React que roda em dispositivos físicos (telas touch), exibindo um avatar 3D interativo com chat por voz e texto.
- **Backend (Lovable Cloud):** Edge Functions serverless que fornecem APIs para comunicação entre Hub e Hardware.

### Fluxo Simplificado

```
┌─────────────┐     Edge Functions      ┌──────────────┐
│  Hub (Web)   │ ◄────────────────────► │ Lovable Cloud │
│  Dashboard   │     REST + Realtime     │  (Supabase)   │
└─────────────┘                          └──────┬───────┘
                                                │
                              Polling 15s + Realtime
                                                │
                                         ┌──────▼───────┐
                                         │ Totem Local   │
                                         │ (Hardware)    │
                                         └──────┬───────┘
                                                │
                                     ┌──────────▼──────────┐
                                     │ Backend Local       │
                                     │ (Ollama + Kokoro)   │
                                     └─────────────────────┘
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

### 2.3 Comunicação Hub ↔ Hardware

| Canal | Direção | Uso |
|-------|---------|-----|
| **Polling** (`totem-config`) | Hardware → Cloud | Config completa a cada 15s (com verificação de hash) |
| **Heartbeat** (`totem-heartbeat`) | Hardware → Cloud | Status, comandos pendentes |
| **Realtime** (Supabase Channels) | Hub → Hardware | Live preview instantâneo do Page Builder |
| **Sync Worker** | Hub → Hardware | Atualização de código-fonte dos arquivos locais |

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
| Framer Motion | Animações |
| react-rnd | Drag & resize no Page Builder |
| Recharts | Gráficos e métricas |
| Supabase JS SDK | Conexão com backend |

### Hardware Local (Totem)
| Tecnologia | Uso |
|------------|-----|
| React + Vite (JSX) | Aplicação do totem |
| Three.js / React Three Fiber | Renderização do avatar 3D |
| @react-three/drei | Helpers 3D (OrbitControls, Loader) |
| Leva | Debug de parâmetros 3D |
| Web Audio API | VAD (Voice Activity Detection) |
| Web Speech API | TTS fallback (modo nuvem) |

### Backend Local (IA)
| Tecnologia | Uso |
|------------|-----|
| Ollama | LLM (processamento de linguagem) |
| Kokoro | TTS (síntese de voz de alta fidelidade) |
| Rhubarb | LipSync (geração de visemas) |
| Express.js | Servidor local (endpoints `/text`, `/sts`) |

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
│   │   └── PageEditorPage.tsx    # Page Builder
│   ├── editor/                   # Page Builder (editor de canvas)
│   │   ├── PageEditor.tsx        # Editor principal
│   │   ├── canvas/               # Canvas livre (drag & drop)
│   │   ├── components/           # Blocos do editor (Text, Image, etc.)
│   │   ├── settings/             # Painéis de propriedades por bloco
│   │   ├── templates/            # Templates pré-definidos
│   │   └── types/                # Tipos TypeScript do editor
│   ├── components/
│   │   ├── layout/               # DashboardLayout, Sidebar
│   │   ├── devices/              # Componentes de dispositivos
│   │   ├── dashboard/            # Dashboards por papel
│   │   ├── page-builder/         # Componentes auxiliares do builder
│   │   └── ui/                   # shadcn/ui components
│   ├── types/
│   │   └── database.ts           # Tipos locais (Device, Org, etc.)
│   └── integrations/
│       └── supabase/
│           ├── client.ts         # Cliente Supabase (auto-gerado)
│           └── types.ts          # Tipos do banco (auto-gerado)
│
├── public/totem-local/           # Código do Hardware Local
│   ├── App.jsx                   # Renderizador do canvas (1080×1920)
│   ├── main.jsx                  # Entry point com SpeechProvider
│   ├── index.html                # HTML do totem
│   ├── index.css                 # Estilos do totem
│   ├── manifest.json             # Controle de versão dos arquivos
│   ├── sync-worker.js            # Worker de sincronização
│   ├── components/
│   │   ├── Avatar.jsx            # Avatar 3D (Three.js, lipsync)
│   │   ├── ChatInterface.jsx     # Interface de chat inline
│   │   └── Scenario.jsx          # Cenário 3D (environment, luzes)
│   ├── hooks/
│   │   ├── useSpeech.jsx         # VAD, TTS, STT, fila de mensagens
│   │   └── useCMSConfig.js       # Hook de configuração via CMS
│   └── docs/                     # Módulos de backend local
│       ├── server.js             # Servidor Express
│       ├── localLLM.mjs          # Integração Ollama
│       ├── kokoro.mjs            # Integração Kokoro TTS
│       ├── whisper.mjs           # Integração Whisper STT
│       ├── knowledge.mjs         # Base de conhecimento local
│       └── aiConfig.mjs          # Config de IA local
│
├── supabase/
│   ├── config.toml               # Configuração Supabase
│   ├── migrations/               # Migrações SQL (auto-gerado)
│   └── functions/                # Edge Functions
│       ├── totem-config/         # Configuração unificada do totem
│       ├── totem-heartbeat/      # Heartbeat + comandos pendentes
│       ├── totem-register/       # Registro de novos dispositivos
│       ├── totem-chat/           # Chat IA via Lovable AI Gateway
│       ├── ai-config/            # Configuração de IA dedicada
│       ├── manage-users/         # CRUD de usuários (admin)
│       └── totem-poll-command/   # Polling de comandos
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
| api_key | UUID | Chave de autenticação do hardware |
| last_ping | TIMESTAMPTZ | Último heartbeat |
| ui_config | JSONB | Configuração de layout (free_canvas) |
| ai_prompt | TEXT | Prompt de IA legado |
| avatar_config | JSONB | Configuração do avatar 3D |
| pending_command | TEXT | Comando pendente (restart, sync, etc.) |
| status_details | JSONB | Detalhes de status (versão, CPU, memória) |
| is_speaking | BOOLEAN | Avatar está falando |

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
| base_url / llm_url / tts_url / stt_url | TEXT | URLs de serviços locais |
| is_active | BOOLEAN | Configuração ativa |

#### `device_versions`
Histórico de versões de modelo 3D por dispositivo.

#### `command_logs`
Log de comandos enviados aos dispositivos (restart, sync, etc.).

#### `layout_templates`
Templates de layout salvos por organização.

### 6.2 Funções SQL

- **`get_user_org_id(user_id)`** → Retorna org_id do usuário
- **`has_role(user_id, role)`** → Verifica se usuário tem determinado papel

---

## 7. Edge Functions (Backend)

### 7.1 `totem-config`
**Propósito:** Fornece configuração unificada (UI + IA) para o hardware em uma única requisição.

| Campo | Detalhes |
|-------|---------|
| **Método** | GET |
| **Auth** | Header `x-totem-api-key` |
| **Resposta** | `{ config: { device_id, device_name, organization, avatar, model, ui, ai } }` |

**Lógica de merge da UI:**
1. Se `ui_config` possui formato modular (`canvas` + `components`), faz merge com defaults
2. Se formato legado, converte para formato modular
3. Inclui `free_canvas` (elementos do Page Builder) quando disponível

**Lógica de IA:**
1. Busca config por `device_id` → se não encontrar, busca por `org_id` → se não encontrar, usa defaults

### 7.2 `totem-heartbeat`
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

### 7.3 `totem-chat`
**Propósito:** Chat por IA usando Lovable AI Gateway (Gemini 3 Flash) como fallback cloud.

| Campo | Detalhes |
|-------|---------|
| **Método** | POST |
| **Auth** | Nenhuma (ou `x-totem-api-key`) |
| **Body** | `{ messages: [{role, content}], device_id }` |
| **Resposta** | SSE stream (Server-Sent Events) |

**Lógica:**
1. Se `device_id` fornecido, busca `system_prompt` e `knowledge_base` da `ai_configs`
2. Segue hierarquia: device → org → default
3. Faz streaming via Lovable AI Gateway

### 7.4 `totem-register`
**Propósito:** Registra um novo dispositivo via Dashboard.

| Campo | Detalhes |
|-------|---------|
| **Método** | POST |
| **Auth** | Bearer token (usuário logado) |
| **Body** | `{ name, description, location, org_id }` |
| **Verificação** | Super Admin pode criar em qualquer org; Org Admin apenas na sua |

### 7.5 `ai-config`
**Propósito:** Endpoint dedicado para buscar apenas config de IA (usado pelo hardware local).

| Campo | Detalhes |
|-------|---------|
| **Método** | GET |
| **Auth** | Header `x-totem-api-key` |
| **Resposta** | `{ config: { system_prompt, knowledge_base, model, voice, ... } }` |

### 7.6 `manage-users`
**Propósito:** CRUD de usuários (apenas Super Admin).

| Ação | Descrição |
|------|-----------|
| `list` | Lista todos os perfis com roles |
| `invite` | Cria usuário com senha aleatória e atribui org + role |
| `update` | Atualiza org_id, role ou full_name |
| `delete` | Remove user_roles, profiles e auth.users |

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
- **📦 Detalhes:** API Key, informações, histórico de comandos, histórico de versões
- **🔄 Code Sync:** Painel de sincronização de código

Funcionalidades:
- Edição inline (nome, descrição, localização)
- Reinicialização remota
- Clonagem de dispositivo
- Realtime updates via Supabase Channels

### 8.5 `/dashboard/organizations` — Organizações
Hierarquia visual com **Cards + Accordion (Collapsible)**:
- Cada organização é um card expansível
- Ao expandir, lista dispositivos com:
  - StatusBadge (online/offline)
  - Localização e versão
  - Último ping (formatTimeAgo)
  - Ações rápidas: reiniciar, ver detalhes
- Métricas: total de orgs, dispositivos, usuários, taxa de disponibilidade
- Busca unificada por org ou dispositivo
- CRUD de organizações (criar, editar, excluir)

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
Editor visual de canvas livre para design do layout do totem.

---

## 9. Page Builder (Editor de Canvas)

### 9.1 Conceito
Editor tipo **Figma/Canva** com canvas fixo de **1080×1920px** (resolução vertical de totem). Elementos são posicionados livremente com drag & drop (react-rnd).

### 9.2 Elementos Suportados (16 tipos)

| Tipo | Descrição |
|------|-----------|
| `text` | Texto com formatação (fonte, cor, alinhamento) |
| `image` | Imagens (URL ou upload) |
| `button` | Botões interativos com prompts de IA |
| `shape` | Formas geométricas (retângulo, círculo, triângulo) |
| `icon` | Ícones Lucide |
| `video` | Embed de vídeo (YouTube, Vimeo) |
| `carousel` | Carrossel de imagens |
| `qrcode` | QR Codes dinâmicos |
| `social` | Links de redes sociais |
| `clock` | Relógio digital/analógico |
| `weather` | Widget de clima |
| `countdown` | Contador regressivo |
| `chat` | Interface de chat IA integrada |
| `map` | Mapas embarcados |
| `iframe` | iFrames genéricos |
| `store` | Vitrine de produtos |

### 9.3 Propriedades por Elemento
Cada elemento possui:
- **Posição:** x, y (absoluto no canvas)
- **Dimensões:** width, height
- **Rotação:** rotation (graus)
- **Camadas:** zIndex
- **Opacidade:** opacity (0-1)
- **Visibilidade:** visible (boolean)
- **Props específicas:** variam por tipo

### 9.4 Fluxo de Salvamento
1. Usuário edita no Page Builder
2. Salva → grava `ui_config.free_canvas` na tabela `devices`
3. **Realtime broadcast** → Hardware recebe atualização instantânea via Supabase Channel
4. **Polling fallback** → Hardware verifica via `totem-config` a cada 15s (comparando hash)

### 9.5 Escala de Visualização
Seletor de largura (320px a 720px) para visualizar o canvas em diferentes resoluções de monitor, mantendo a proporção 1080×1920.

---

## 10. Aplicação Local do Totem (Hardware)

### 10.1 Estrutura
- **`App.jsx`** (v4.13.0) — Renderizador principal do canvas livre
- **`main.jsx`** — Entry point com `SpeechProvider`
- **`components/Avatar.jsx`** — Avatar 3D com Three.js e lipsync
- **`components/ChatInterface.jsx`** — Interface de chat inline
- **`components/Scenario.jsx`** — Cenário 3D (environment, luzes, câmera)
- **`hooks/useSpeech.jsx`** — VAD, TTS, STT, fila de mensagens
- **`hooks/useCMSConfig.js`** — Config via CMS (AI config + cenário)
- **`sync-worker.js`** — Worker de sincronização de código

### 10.2 Renderização do Canvas
O `App.jsx` recebe o `free_canvas` (do `totem-config`) e renderiza cada elemento com posicionamento absoluto pixel-perfect em um container de 1080×1920px escalado para a tela.

**Elementos renderizados:**
- Cada tipo tem um renderizador dedicado
- Elementos interativos são wrapped em handlers de toque
- O avatar 3D é renderizado via React Three Fiber separadamente

### 10.3 Sistema de Polling Inteligente
```
useConfigPoller → fetch totem-config a cada 15s
                → compara hash (JSON.stringify)
                → só atualiza se houver mudança real
```

### 10.4 Live Preview
Via Supabase Realtime (broadcast channel), o Hub envia atualizações do canvas instantaneamente durante a edição no Page Builder.

### 10.5 Chat IA (Modo Dual)
```
           ┌─── VITE_API_URL definido? ───┐
           │                               │
         SIM                              NÃO
           │                               │
     ┌─────▼──────┐              ┌─────────▼──────────┐
     │ Modo LOCAL  │              │ Modo CLOUD          │
     │ Ollama LLM  │              │ totem-chat (Gemini) │
     │ Kokoro TTS  │              │ Web Speech API      │
     │ Rhubarb Lip │              │                     │
     └─────┬──────┘              └────────────────────┘
           │
     Se falhar → fallback automático para CLOUD
```

### 10.6 Funções Globais (Bridge)
| Função | Uso |
|--------|-----|
| `window.__totemSendMessage(prompt)` | Envia mensagem para pipeline de IA |
| `window.__totemPlayMessage(msg)` | Processa resposta local (áudio + lipsync) |
| `window.__totemSpeakAvatar(text)` | Aciona Web Speech API (modo cloud) |

### 10.7 Sincronização de Código (Sync Worker)
- Monitora `manifest.json` no Hub para detectar mudanças de versão
- Download automático de arquivos atualizados
- Reinicialização via PM2 para aplicar atualizações
- Unidirecional: Hub → Local (nunca o contrário)
- Não remove arquivos deletados automaticamente (requer limpeza manual)

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

### 11.4 Backend Local vs Cloud

| Aspecto | Local (Ollama) | Cloud (Lovable AI) |
|---------|-----------------|---------------------|
| Modelo | llama3.2:1b (configurável) | Gemini 3 Flash |
| TTS | Kokoro (alta fidelidade) | Web Speech API |
| LipSync | Rhubarb (visemas) | Não disponível |
| Latência | Baixa (local) | Dependente de rede |
| Requisito | Servidor local | Apenas internet |
| Streaming | Sim | Sim (SSE) |

---

## 12. Sincronização e Comunicação

### 12.1 Fluxo de Atualização de Layout

```
Hub (Page Builder)
  │
  ├── Salvar → UPDATE devices.ui_config (DB)
  │
  ├── Live Preview → Supabase Realtime broadcast (instantâneo)
  │
  └── Hardware recebe por:
       ├── Realtime channel (se conectado) → atualiza imediatamente
       └── Config poller (15s) → compara hash, atualiza se diferente
```

### 12.2 Fluxo de Comandos Remotos

```
Hub → UPDATE devices.pending_command = 'restart'
    → INSERT command_logs (status: 'pending')
    │
    ▼ (próximo heartbeat do hardware)
    │
Hardware → POST totem-heartbeat
         → Recebe command: 'restart' na resposta
         → Executa comando
         │
Cloud   → UPDATE devices.pending_command = NULL
        → UPDATE command_logs.status = 'executed'
```

### 12.3 Comandos Suportados

| Comando | Ação |
|---------|------|
| `restart` | Reinicia o processo do totem |
| `sync` | Força sincronização de código |
| `reload` | Recarrega a página do totem |

---

## 13. Fluxos Principais

### 13.1 Registro de Novo Dispositivo
1. Super/Org Admin acessa "Dispositivos" → "Novo Dispositivo"
2. Preenche nome, descrição, localização, organização
3. Edge Function `totem-register` cria device com `api_key` gerada automaticamente
4. API Key é exibida para copiar e configurar no `.env` do hardware local

### 13.2 Configuração de um Totem
1. Admin edita layout no **Page Builder** (canvas livre)
2. Admin configura **IA** (prompt, knowledge base, voz) na página de AI Configs
3. Configurações propagam via Realtime + Polling para o hardware
4. Hardware aplica novo layout e comportamento de IA

### 13.3 Interação do Usuário Final (Totem Físico)
1. Visitante toca na tela do totem
2. Chat IA é ativado (texto ou voz)
3. Mensagem processada localmente (Ollama) ou na nuvem (Gemini)
4. Avatar 3D responde com animação de fala + áudio sincronizado
5. Interação registrada via heartbeat (`is_speaking`, `last_interaction`)

### 13.4 Monitoramento
1. Dashboard mostra métricas em tempo real
2. Dispositivos com `last_ping > 90s` são marcados como offline
3. Comandos podem ser enviados remotamente
4. Histórico de comandos e versões disponível

---

## 14. Variáveis de Ambiente

### Hub (Dashboard) — `.env`
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Hardware Local (Totem) — `.env`
```env
# Conexão com o Hub
VITE_CMS_API_URL=https://xxx.supabase.co/functions/v1
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_TOTEM_API_KEY=<uuid-da-api-key>
VITE_TOTEM_DEVICE_ID=<uuid-do-dispositivo>

# Backend Local (IA)
VITE_API_URL=http://localhost:3000
VITE_TENANT_ID=default

# Sync Worker
HUB_URL=https://xxx.lovable.app
LOCAL_DIR=./
SUPABASE_URL=https://xxx.supabase.co
API_KEY=<uuid-da-api-key>
VERBOSE=true
BACKUP_FILES=false
```

### Edge Functions (automático)
```env
SUPABASE_URL        # Auto-configurado
SUPABASE_ANON_KEY   # Auto-configurado
SUPABASE_SERVICE_ROLE_KEY  # Auto-configurado
LOVABLE_API_KEY     # Para Lovable AI Gateway
```

---

> **Nota:** Esta documentação reflete o estado do projeto em fevereiro de 2026. Para atualizações, consulte o código-fonte e os comentários inline.
