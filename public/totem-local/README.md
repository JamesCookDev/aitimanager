# 🖥️ Totem AITI — Guia de Instalação

## O que você precisa

- PC com **Windows 10/11**, Linux ou macOS
- **Node.js** instalado ([nodejs.org](https://nodejs.org))
- Conexão com a **internet**

---

## Passo a Passo

### 1. Copie os arquivos para o PC

```
C:\Totem\
  ├── sync-worker.js
  └── .env
```

### 2. Configure o `.env`

```env
VITE_CMS_API_URL=https://iwqcltmeniotzbowbxzg.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://iwqcltmeniotzbowbxzg.supabase.co
VITE_TOTEM_DEVICE_ID=cole-o-uuid-do-dispositivo-aqui
```

### 3. Execute

```bash
node sync-worker.js
```

O worker vai:
1. ✅ Buscar o HTML publicado do servidor
2. ✅ Servir localmente na porta 8080
3. ✅ Abrir o navegador em **modo kiosk** (tela cheia)
4. ✅ Verificar atualizações automaticamente
5. ✅ Escutar comandos remotos (reiniciar, sync)

> Sem kiosk: `node sync-worker.js --no-kiosk`

---

## Reinicialização Remota

No **Hub AITI**: Dispositivos → selecione o totem → botão **Reiniciar**

---

## Início Automático

### Windows
1. `Win + R` → `shell:startup`
2. Crie um atalho com: `node C:\Totem\sync-worker.js`

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
ExecStart=/usr/bin/node /caminho/para/totem/sync-worker.js
Restart=always
RestartSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable totem && sudo systemctl start totem
```

---

## Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Node.js não encontrado" | Instale em [nodejs.org](https://nodejs.org) |
| Tela branca | Aguarde 15s, o servidor está iniciando |
| Totem offline no painel | Verifique a conexão com a internet |
| Navegador não abre | Verifique se Chrome ou Edge está instalado |
