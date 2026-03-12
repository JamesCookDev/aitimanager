# 🖥️ Totem AITI — Guia de Instalação

## O que você precisa

- PC com **Windows 10/11** (ou Linux/macOS)
- **Node.js** instalado ([nodejs.org](https://nodejs.org))
- Conexão com a **internet**

---

## Passo a Passo

### 1. Copie os arquivos para o PC

Crie a pasta `C:\Totem` e copie os arquivos:

```
C:\Totem\
  ├── start-totem.bat
  ├── sync-worker.js
  ├── .env
  └── .env.sync.example  (referência)
```

### 2. Configure o `.env`

O arquivo `.env` precisa ter no mínimo:

```env
VITE_CMS_API_URL=https://iwqcltmeniotzbowbxzg.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://iwqcltmeniotzbowbxzg.supabase.co
VITE_TOTEM_DEVICE_ID=cole-o-uuid-do-dispositivo-aqui
HTTP_PORT=8080
```

### 3. Execute o script

Dê **duplo clique** no `start-totem.bat`.

O worker vai:
1. ✅ Buscar o **HTML publicado** do servidor
2. ✅ Servir localmente na porta 8080
3. ✅ Abrir o **navegador em tela cheia** (kiosk)
4. ✅ Verificar atualizações automaticamente

---

## Reinicialização Remota

Pelo **Hub AITI** (painel web), você pode reiniciar o totem remotamente:

1. Acesse **Dispositivos** → selecione o totem
2. Clique no botão **Reiniciar**
3. O worker será reiniciado automaticamente

> O script `start-totem` monitora o worker e o reinicia automaticamente caso ele pare.

---

## Início Automático

### Windows
1. Pressione `Win + R`
2. Digite `shell:startup` e aperte **Enter**
3. Crie um **atalho** do `start-totem.bat` e cole na pasta

### Linux (systemd)
```bash
sudo tee /etc/systemd/system/totem.service << EOF
[Unit]
Description=Totem AITI
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/caminho/para/totem
ExecStart=/bin/bash /caminho/para/totem/start-totem.sh
Restart=always
RestartSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable totem
sudo systemctl start totem
```

---

## Comandos Úteis

| Ação | Como fazer |
|------|-----------|
| **Parar o totem** | Feche a janela do terminal (Ctrl+C) |
| **Reiniciar** | Feche e abra o `start-totem.bat` |
| **Sem tela cheia** | `start-totem.bat --no-kiosk` |
| **Sair do kiosk** | `Alt + F4` ou `Ctrl + W` |
| **Reiniciar remotamente** | Botão "Reiniciar" no Hub |

---

## Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Node.js não encontrado" | Instale em [nodejs.org](https://nodejs.org) |
| Tela branca no navegador | Aguarde 15s, o servidor está iniciando |
| Totem offline no painel | Verifique a conexão com a internet |
| Navegador não abre em kiosk | Verifique se Chrome ou Edge está instalado |

---

**Suporte:** Entre em contato com o time de desenvolvimento para obter o Device ID ou reportar problemas.
