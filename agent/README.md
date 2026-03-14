# Totem Agent

Agente instalável para totems com provisionamento automático.  
Distribuível como executável Windows — **sem exigir Node.js** na máquina do cliente.

## Arquitetura

```
agent/
├── src/
│   └── main.js          ← Entrypoint CommonJS (compatível com pkg)
├── scripts/
│   └── prepare-dist.js  ← Gera pacote de distribuição
├── dist/                ← Output do build (gerado)
│   ├── totem-agent.exe  ← Executável standalone
│   └── totem-agent-win/ ← Pacote pronto para distribuição
│       ├── totem-agent.exe
│       ├── instalar.bat
│       ├── desinstalar.bat
│       └── LEIA-ME.txt
├── assets/              ← Assets opcionais (activation.html customizado)
├── package.json
└── README.md
```

## Desenvolvimento

```bash
cd agent
npm install

# Rodar em modo desenvolvimento
npm start

# Rodar sem abrir kiosk
npm run start:no-kiosk

# Resetar provisionamento
npm run reset
```

## Build para Windows

### Pré-requisitos (máquina de build)

- Node.js 18+ instalado
- npm instalado

### Gerar executável

```bash
cd agent
npm install
npm run build:win     # Gera dist/totem-agent.exe
npm run dist          # Gera pacote completo em dist/totem-agent-win/
```

O executável gerado (~45MB) inclui o runtime Node.js embutido.

### Distribuição

A pasta `dist/totem-agent-win/` contém tudo que o cliente precisa:

1. **totem-agent.exe** — Executável standalone
2. **instalar.bat** — Script de instalação (copia, configura autostart)
3. **desinstalar.bat** — Remove o agente
4. **LEIA-ME.txt** — Instruções para o cliente

Comprima em `.zip` e envie ao cliente.

## Fluxo do Cliente

1. Recebe o `.zip` e descompacta
2. Executa `instalar.bat` (duplo clique)
3. O navegador abre automaticamente com a tela de ativação
4. Informa o código de ativação (obtido no painel web)
5. Totem ativado e operando ✅

## Modos de Operação

### Não provisionado
- Exibe tela de ativação no navegador
- Aguarda o código de ativação da organização
- Após ativação, reinicia automaticamente em modo operacional

### Provisionado
- Sincroniza conteúdo publicado a cada 15s
- Envia heartbeat a cada 30s
- Processa comandos remotos a cada 5s
- Abre navegador em modo kiosk

## Persistência

Dados do dispositivo ficam em `runtime/` ao lado do executável:

```
C:\ProgramData\TotemAgent\
├── totem-agent.exe
└── runtime/
    ├── device.json    ← Credenciais do dispositivo
    ├── config.json    ← Configuração operacional
    ├── index.html     ← Conteúdo publicado (cache local)
    └── logs/          ← Logs de operação
```

## Compatibilidade

- O `.env` continua funcionando como fallback para desenvolvimento
- Migração automática de `.env` para `runtime/` na primeira execução
- Funciona com ou sem empacotamento (Node.js direto ou .exe)
