#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  TOTEM STARTUP SCRIPT — Linux/macOS (.sh)
#
#  Este script faz TUDO automaticamente:
#    1. Instala Node.js (se necessário) via nvm ou apt
#    2. Instala Git (se necessário) via apt/brew
#    3. Clona o repositório do GitHub (se necessário)
#    4. Executa o sync-worker.js (sync + servidores + kiosk)
#
#  Para iniciar automaticamente no boot (Linux):
#    - Veja instruções de systemd no final deste arquivo
#
#  Flags opcionais:
#    ./start-totem.sh --no-kiosk    (sem abrir navegador)
#    ./start-totem.sh --setup       (apenas instalar, sem rodar)
# ══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "========================================================"
echo "  TOTEM AITI — Setup Automático"
echo "========================================================"
echo ""

# ── FASE 0: Verificar/Instalar Node.js ──────────────────────
if ! command -v node &> /dev/null; then
    echo "[Setup] Node.js não encontrado. Instalando..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux — usar NodeSource
        echo "[Setup] Instalando Node.js 20.x via NodeSource..."
        if command -v curl &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v wget &> /dev/null; then
            wget -qO- https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            echo "[Setup] ERRO: Nem curl nem wget disponíveis."
            echo "[Setup] Instale manualmente: https://nodejs.org"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS — usar Homebrew
        if command -v brew &> /dev/null; then
            echo "[Setup] Instalando Node.js via Homebrew..."
            brew install node
        else
            echo "[Setup] ERRO: Homebrew não encontrado."
            echo "[Setup] Instale: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo "[Setup] Depois rode novamente este script."
            exit 1
        fi
    else
        echo "[Setup] SO não suportado para auto-instalação."
        echo "[Setup] Instale Node.js manualmente: https://nodejs.org"
        exit 1
    fi
    
    # Verificar se instalou
    if ! command -v node &> /dev/null; then
        echo "[Setup] ERRO: Node.js não foi instalado corretamente."
        exit 1
    fi
fi

echo "[Setup] Node.js $(node --version) OK"

# ── FASE 0.5: Verificar/Instalar Git ────────────────────────
if ! command -v git &> /dev/null; then
    echo "[Setup] Git não encontrado. Instalando..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y git
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install git
        else
            echo "[Setup] Instalando Xcode Command Line Tools (inclui Git)..."
            xcode-select --install
            echo "[Setup] Aguarde a instalação e rode novamente."
            exit 0
        fi
    fi
    
    if ! command -v git &> /dev/null; then
        echo "[Setup] ERRO: Git não foi instalado corretamente."
        echo "[Setup] Instale manualmente: https://git-scm.com"
        exit 1
    fi
fi

echo "[Setup] $(git --version) OK"

# ── FASE 1: Clonar repositório (se necessário) ──────────────
REPO_URL="https://github.com/JamesCookDev/Avatar-AI.git"
REPO_BRANCH="feat/escalavel"
APP_DIR="$SCRIPT_DIR/app"

if [ ! -d "$APP_DIR/.git" ]; then
    echo ""
    echo "[Setup] Clonando repositório..."
    echo "[Setup] $REPO_URL (branch: $REPO_BRANCH)"
    
    if [ -d "$APP_DIR" ]; then
        echo "[Setup] Removendo pasta app antiga..."
        rm -rf "$APP_DIR"
    fi
    
    git clone --branch "$REPO_BRANCH" --single-branch --depth 1 "$REPO_URL" "$APP_DIR"
    
    if [ $? -ne 0 ]; then
        echo "[Setup] ERRO: Falha ao clonar repositório!"
        echo "[Setup] Verifique a conexão com a internet."
        exit 1
    fi
    
    echo "[Setup] Repositório clonado com sucesso!"
else
    echo "[Setup] Repositório já existe. Atualizando..."
    cd "$APP_DIR"
    git fetch origin "$REPO_BRANCH"
    git reset --hard "origin/$REPO_BRANCH"
    cd "$SCRIPT_DIR"
    echo "[Setup] Repositório atualizado!"
fi

# ── FASE 2: Copiar .env para dentro do app (se necessário) ──
if [ ! -f "$APP_DIR/.env" ] && [ -f "$SCRIPT_DIR/.env" ]; then
    echo "[Setup] Copiando .env para o app..."
    cp "$SCRIPT_DIR/.env" "$APP_DIR/.env"
fi

echo ""
echo "========================================================"
echo "  TOTEM AITI — Iniciando Worker"
echo "========================================================"
echo ""

# ── FASE 3: Loop de restart automático ──────────────────────
while true; do
    cd "$APP_DIR"
    
    # Copiar sync-worker atualizado para dentro do app
    if [ -f "$SCRIPT_DIR/sync-worker.js" ]; then
        cp "$SCRIPT_DIR/sync-worker.js" "$APP_DIR/sync-worker.js"
    fi
    
    node sync-worker.js "$@"
    
    echo ""
    echo "[Totem] Worker encerrado. Reiniciando em 10s..."
    sleep 10
done

# ══════════════════════════════════════════════════════════════
#  AUTOSTART COM SYSTEMD (Linux):
#
#  sudo tee /etc/systemd/system/totem.service << EOF
#  [Unit]
#  Description=Totem AITI
#  After=network.target
#
#  [Service]
#  Type=simple
#  User=$USER
#  WorkingDirectory=$SCRIPT_DIR
#  ExecStart=/bin/bash $SCRIPT_DIR/start-totem.sh
#  Restart=always
#  RestartSec=10
#  Environment=DISPLAY=:0
#
#  [Install]
#  WantedBy=multi-user.target
#  EOF
#
#  sudo systemctl enable totem
#  sudo systemctl start totem
# ══════════════════════════════════════════════════════════════
