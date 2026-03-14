# Totem Agent — Build & Distribuição

## Fluxo Automático (CI/CD)

Toda alteração na pasta `agent/` que chegar na branch `main` dispara o pipeline automaticamente.

### O que acontece:
1. GitHub Actions instala dependências e gera o `.exe` via `pkg`
2. O script `prepare-dist.js` monta o pacote com `instalar.bat` e `desinstalar.bat`
3. Um arquivo `TotemAgent-Instalador.zip` é gerado
4. Uma **Release** é criada/atualizada no GitHub com o `.zip` anexado

### Onde pegar o artefato:
- **GitHub Releases** → procure por `Totem Agent vX.X.X` → baixe `TotemAgent-Instalador.zip`
- Ou na aba **Actions** do repositório → último workflow bem-sucedido → seção Artifacts

### Nome do artefato final:
`TotemAgent-Instalador.zip` contendo:
- `totem-agent.exe` — executável standalone
- `instalar.bat` — script de instalação automática
- `desinstalar.bat` — script de remoção
- `LEIA-ME.txt` — instruções para o cliente

## Build Manual (se necessário)

```bash
cd agent
npm install
npm run dist
# Output: agent/dist/totem-agent-win/
```

## Disparar build manualmente

Na aba **Actions** do GitHub, selecione "Build Totem Agent" e clique em **Run workflow**.

## Atualizando a versão

Antes de publicar uma nova versão, atualize o campo `version` em `agent/package.json`.
