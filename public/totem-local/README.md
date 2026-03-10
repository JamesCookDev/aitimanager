# 🖥️ Totem AITI — Guia de Instalação

## O que você precisa

- PC com **Windows 10/11** (ou Linux)
- Conexão com a **internet**
- Um **pen drive** com estes arquivos:
  - `start-totem.bat`
  - `.env` (preenchido pelo time de suporte)

---

## Passo a Passo

### 1. Copie os arquivos para o PC

Crie a pasta `C:\Totem` e copie os 2 arquivos do pen drive para lá:

```
C:\Totem\
  ├── start-totem.bat
  └── .env
```

### 2. Execute o script

Dê **duplo clique** no `start-totem.bat`.

Na primeira vez ele vai:
1. ✅ Instalar o **Node.js** (se não tiver)
2. ✅ Instalar o **Git** (se não tiver)
3. ✅ Baixar a **aplicação** do GitHub
4. ✅ Instalar as **dependências** (npm install)
5. ✅ Abrir o **navegador em tela cheia** (kiosk)

> ⚠️ **Na primeira execução**, pode pedir para **fechar e abrir o script de novo** (atualização de PATH do Windows). Isso é normal e só acontece 1 vez.

### 3. Configure o início automático

Para o totem ligar sozinho quando o PC iniciar:

1. Pressione `Win + R`
2. Digite `shell:startup` e aperte **Enter**
3. Crie um **atalho** do `start-totem.bat` (`C:\Totem\start-totem.bat`)
4. Cole o atalho na pasta que abriu

Pronto! O totem vai iniciar automaticamente a cada boot.

---

## Configuração do `.env`

O arquivo `.env` precisa ter no mínimo:

```env
# URL do backend (não alterar)
VITE_CMS_API_URL=https://iwqcltmeniotzbowbxzg.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://iwqcltmeniotzbowbxzg.supabase.co

# ⬇️ PREENCHA COM O ID DA ORGANIZAÇÃO (pedir ao suporte)
VITE_ORG_ID=cole-o-uuid-aqui

# Opcional — nome e local do totem
VITE_TOTEM_NAME=Totem Recepção
VITE_TOTEM_LOCATION=Entrada Principal
```

> O `VITE_ORG_ID` é fornecido pelo time de suporte. Cada cliente tem o seu.

---

## Comandos Úteis

| Ação | Como fazer |
|------|-----------|
| **Parar o totem** | Feche a janela do terminal (Ctrl+C) |
| **Reiniciar** | Feche e abra o `start-totem.bat` |
| **Sem tela cheia** | `start-totem.bat --no-kiosk` |
| **Sair do kiosk** | `Alt + F4` ou `Ctrl + W` |
| **Ver logs** | Olhe a janela do terminal aberta |

---

## Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Node.js não encontrado" após instalar | Feche e abra o script novamente |
| Tela branca no navegador | Aguarde 15s, o servidor pode estar iniciando |
| "Falha ao clonar repositório" | Verifique a conexão com a internet |
| Totem não aparece no painel | Verifique se o `VITE_ORG_ID` está correto no `.env` |
| Navegador não abre em tela cheia | Verifique se Chrome ou Edge está instalado |

---

## Estrutura Final (após instalação)

```
C:\Totem\
  ├── start-totem.bat      ← script de inicialização
  ├── .env                 ← configuração do totem
  └── app/                 ← criado automaticamente
       ├── src/
       ├── package.json
       ├── sync-worker.js
       └── ...
```

> ⚠️ **Não mexa na pasta `app/`** — ela é gerenciada automaticamente.

---

## Linux / macOS

Use o `start-totem.sh` ao invés do `.bat`:

```bash
chmod +x start-totem.sh
./start-totem.sh
```

Para autostart no Linux, veja as instruções de **systemd** no final do arquivo `start-totem.sh`.

---

**Suporte:** Entre em contato com o time de desenvolvimento para obter o `VITE_ORG_ID` ou reportar problemas.
