# 📦 Documentação dos Elementos do Page Builder

> Canvas: **1080×1920** (Full HD vertical para totens interativos)

---

## 📐 Estrutura Base de um Elemento

Todo elemento no canvas compartilha a seguinte estrutura (`CanvasElement`):

| Propriedade | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único gerado automaticamente |
| `type` | `ElementType` | Tipo do elemento (ver seções abaixo) |
| `x`, `y` | `number` | Posição no canvas (pixels) |
| `width`, `height` | `number` | Dimensões em pixels |
| `rotation` | `number` | Rotação em graus |
| `zIndex` | `number` | Camada de empilhamento |
| `opacity` | `number` | Opacidade (0–1) |
| `locked` | `boolean` | Impede movimentação/redimensionamento |
| `visible` | `boolean` | Visibilidade no canvas |
| `name` | `string` | Nome exibido na lista de camadas |
| `viewId` | `string \| null` | Página/view a que pertence |
| `props` | `Record<string, any>` | Propriedades específicas do tipo |

---

## 🎯 Categoria: Totem

### 1. CTA Grande (`bigcta`)
**Tamanho padrão:** 600×180 · **Renderer:** `BigCTARenderer` · **Painel:** genérico

Botão de chamada principal com efeito de pulso para atrair atenção.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `string` | `"Toque para começar"` | Texto principal |
| `sublabel` | `string` | `""` | Subtítulo opcional |
| `icon` | `string` | `"👆"` | Emoji ou ícone |
| `bgColor` | `string` | `"#6366f1"` | Cor de fundo |
| `textColor` | `string` | `"#ffffff"` | Cor do texto |
| `fontSize` | `number` | `28` | Tamanho da fonte principal |
| `sublabelSize` | `number` | `14` | Tamanho do subtítulo |
| `borderRadius` | `number` | `24` | Arredondamento das bordas |
| `pulse` | `boolean` | `true` | Animação de pulso |

---

### 2. Senha (`ticket`)
**Tamanho padrão:** 360×400 · **Renderer:** `TicketRenderer` · **Painel:** genérico

Painel de senhas para filas e atendimento.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `prefix` | `string` | `"A"` | Prefixo da senha |
| `currentNumber` | `number` | `42` | Número atual |
| `bgColor` | `string` | `"rgba(0,0,0,0.5)"` | Fundo do painel |
| `textColor` | `string` | `"#ffffff"` | Cor do texto |
| `accentColor` | `string` | `"#6366f1"` | Cor de destaque |
| `fontSize` | `number` | `72` | Tamanho do número |
| `borderRadius` | `number` | `20` | Arredondamento |
| `label` | `string` | `"Sua senha"` | Rótulo superior |
| `labelSize` | `number` | `16` | Tamanho do rótulo |
| `showPrint` | `boolean` | `true` | Mostrar botão imprimir |
| `printLabel` | `string` | `"🖨️ Retirar Senha"` | Texto do botão |

---

### 3. QR Pix (`qrpix`)
**Tamanho padrão:** 360×480 · **Renderer:** `QRPixRenderer` · **Painel:** genérico

Pagamento via Pix com QR Code dinâmico.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pixKey` | `string` | `"12345678901"` | Chave Pix |
| `amount` | `string` | `"R$ 0,00"` | Valor da cobrança |
| `recipientName` | `string` | `"Empresa LTDA"` | Nome do recebedor |
| `bgColor` | `string` | `"rgba(0,0,0,0.5)"` | Fundo |
| `textColor` | `string` | `"#ffffff"` | Cor do texto |
| `accentColor` | `string` | `"#32bcad"` | Cor de destaque |
| `borderRadius` | `number` | `20` | Arredondamento |
| `showAmount` | `boolean` | `true` | Exibir valor |
| `label` | `string` | `"Pague com Pix"` | Rótulo |

---

### 4. Teclado Numérico (`numpad`)
**Tamanho padrão:** 400×600 · **Renderer:** `NumpadRenderer` · **Painel:** genérico

Entrada numérica com máscara (CPF, telefone, etc.).

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `string` | `"Digite seu CPF"` | Instrução |
| `placeholder` | `string` | `"000.000.000-00"` | Placeholder |
| `bgColor` | `string` | `"rgba(0,0,0,0.5)"` | Fundo |
| `textColor` | `string` | `"#ffffff"` | Cor do texto |
| `accentColor` | `string` | `"#6366f1"` | Cor de destaque |
| `borderRadius` | `number` | `20` | Arredondamento |
| `maxLength` | `number` | `11` | Máx. caracteres |
| `mask` | `string` | `"cpf"` | Máscara aplicada |
| `buttonLabel` | `string` | `"Confirmar"` | Texto do botão |

---

## ✏️ Categoria: Conteúdo

### 5. Texto (`text`)
**Tamanho padrão:** 400×80 · **Renderer:** `TextRenderer` · **Painel:** genérico

Suporta interpolação de variáveis via `{{variavel}}`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `text` | `string` | `"Seu texto aqui"` | Conteúdo (suporta `{{var}}`) |
| `fontSize` | `number` | `32` | Tamanho da fonte |
| `fontWeight` | `string` | `"bold"` | Peso da fonte |
| `color` | `string` | `"#ffffff"` | Cor do texto |
| `align` | `string` | `"center"` | Alinhamento (`left`, `center`, `right`) |
| `fontFamily` | `string` | `"Inter"` | Família tipográfica |

---

### 6. Imagem (`image`)
**Tamanho padrão:** 400×300 · **Renderer:** `ImageRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `src` | `string` | `""` | URL da imagem |
| `fit` | `string` | `"cover"` | `cover`, `contain`, `fill` |
| `borderRadius` | `number` | `12` | Arredondamento |

---

### 7. Botão (`button`)
**Tamanho padrão:** 360×64 · **Renderer:** `ButtonRenderer` · **Painel:** genérico

Botão interativo com ações configuráveis.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `string` | `"Toque aqui"` | Texto do botão |
| `bgColor` | `string` | `"#6366f1"` | Cor de fundo |
| `textColor` | `string` | `"#ffffff"` | Cor do texto |
| `fontSize` | `number` | `18` | Tamanho da fonte |
| `borderRadius` | `number` | `999` | Arredondamento (999 = pill) |
| `actionType` | `ButtonActionType` | `"prompt"` | `prompt`, `url`, `navigate` |
| `action` | `string` | `""` | Valor da ação (prompt/URL) |
| `navigateTarget` | `string` | `""` | ID da view de destino |
| `navigateTransition` | `PageTransition` | `"fade"` | `none`, `fade`, `slide-left`, `slide-right`, `slide-up`, `zoom` |

---

### 8. Forma (`shape`)
**Tamanho padrão:** 200×200 · **Renderer:** `ShapeRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `shapeType` | `string` | `"rectangle"` | `rectangle`, `circle` |
| `fill` | `string` | `"#6366f1"` | Cor de preenchimento |
| `borderRadius` | `number` | `16` | Arredondamento |
| `borderColor` | `string` | `"transparent"` | Cor da borda |
| `borderWidth` | `number` | `0` | Largura da borda |

---

### 9. Ícone (`icon`)
**Tamanho padrão:** 80×80 · **Renderer:** `IconRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `icon` | `string` | `"⭐"` | Emoji ou ícone |
| `size` | `number` | `48` | Tamanho em pixels |
| `color` | `string` | `"#ffffff"` | Cor |

---

## 🎬 Categoria: Mídia

### 10. Vídeo (`video`)
**Tamanho padrão:** 480×320 · **Renderer:** `VideoRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `url` | `string` | `""` | URL do vídeo (MP4, YouTube, etc.) |
| `autoplay` | `boolean` | `true` | Reprodução automática |
| `loop` | `boolean` | `true` | Repetir |
| `muted` | `boolean` | `true` | Sem som |
| `borderRadius` | `number` | `12` | Arredondamento |

---

### 11. Carrossel (`carousel`)
**Tamanho padrão:** 480×360 · **Renderer:** `CarouselRenderer` · **Painel:** `CarouselPropsPanel`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `images` | `string[]` | `[]` | Lista de URLs |
| `autoplay` | `boolean` | `true` | Avançar automaticamente |
| `interval` | `number` | `5` | Intervalo em segundos |
| `borderRadius` | `number` | `12` | Arredondamento |
| `transition` | `string` | `"fade"` | Tipo de transição |

---

### 12. Galeria (`gallery`)
**Tamanho padrão:** 420×420 · **Renderer:** `GalleryRenderer` · **Painel:** `GalleryPropsPanel`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `images` | `string[]` | `[]` | Lista de URLs |
| `columns` | `number` | `2` | Colunas do grid |
| `gap` | `number` | `8` | Espaçamento |
| `borderRadius` | `number` | `12` | Arredondamento |
| `aspectRatio` | `string` | `"1/1"` | Proporção das imagens |

---

### 13. Feed de Lojas (`feed`)
**Tamanho padrão:** 480×700 · **Renderer:** `FeedRenderer` · **Painel:** `FeedPropsPanel`

Diretório de lojas com cards visuais, busca em tempo real, e overlay de detalhes.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `posts` | `array` | `[]` | Lista de lojas (ver sub-props) |
| `layout` | `string` | `"vertical"` | `vertical` ou `horizontal` |
| `bgColor` | `string` | `"transparent"` | Fundo geral |
| `cardBgColor` | `string` | `"rgba(0,0,0,0.6)"` | Fundo dos cards |
| `textColor` | `string` | `"#ffffff"` | Cor do texto |
| `accentColor` | `string` | `"#ef4444"` | Cor de destaque |
| `borderRadius` | `number` | `16` | Arredondamento geral |
| `cardBorderRadius` | `number` | `12` | Arredondamento dos cards |
| `gap` | `number` | `16` | Espaçamento entre cards |
| `showSearch` | `boolean` | `false` | Mostrar barra de busca |
| `showTags` | `boolean` | `true` | Mostrar tags |
| `showAddress` | `boolean` | `true` | Mostrar endereço |
| `showHours` | `boolean` | `true` | Mostrar horário |

**Sub-props de cada post (loja):**

| Prop | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único |
| `title` | `string` | Nome da loja |
| `category` | `string` | Categoria |
| `avatar` | `string` | Logo da loja (URL) |
| `image` | `string` | Imagem principal |
| `gallery` | `string[]` | Galeria de imagens |
| `rating` | `number` | Avaliação (1–5) |
| `address` | `string` | Endereço |
| `hours` | `string` | Horário de funcionamento |
| `phone` | `string` | Telefone |
| `tags` | `string` | Tags separadas por vírgula |
| `description` | `string` | Descrição detalhada |

---

### 14. Iframe (`iframe`)
**Tamanho padrão:** 480×400 · **Renderer:** `IframeRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `url` | `string` | `""` | URL do conteúdo externo |
| `borderRadius` | `number` | `8` | Arredondamento |

---

## 🔗 Categoria: Interação

### 15. QR Code (`qrcode`)
**Tamanho padrão:** 200×200 · **Renderer:** `QRRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `string` | `"https://example.com"` | Conteúdo codificado |
| `fgColor` | `string` | `"#ffffff"` | Cor do código |
| `bgColor` | `string` | `"transparent"` | Cor de fundo |

---

### 16. Chat IA (`chat`)
**Tamanho padrão:** 420×500 · **Renderer:** `ChatRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `placeholder` | `string` | `"Pergunte algo..."` | Placeholder do input |
| `theme` | `string` | `"dark"` | Tema visual |

---

### 17. Formulário (`form`)
**Tamanho padrão:** 420×500 · **Renderer:** `FormRenderer` · **Painel:** `FormPropsPanel`

Formulário interativo com campos dinâmicos e envio para o backend.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | `"Check-in"` | Título do formulário |
| `titleColor` | `string` | `"#ffffff"` | Cor do título |
| `titleSize` | `number` | `22` | Tamanho do título |
| `bgColor` | `string` | `"rgba(0,0,0,0.5)"` | Fundo |
| `borderRadius` | `number` | `16` | Arredondamento |
| `fields` | `array` | (ver abaixo) | Lista de campos |
| `submitLabel` | `string` | `"Enviar"` | Texto do botão |
| `submitBgColor` | `string` | `"#6366f1"` | Cor do botão |
| `submitTextColor` | `string` | `"#ffffff"` | Cor do texto do botão |
| `accentColor` | `string` | `"#6366f1"` | Cor de destaque |
| `fieldBgColor` | `string` | `"rgba(255,255,255,0.1)"` | Fundo dos campos |
| `fieldTextColor` | `string` | `"#ffffff"` | Cor do texto dos campos |
| `successMessage` | `string` | `"Enviado com sucesso! ✅"` | Mensagem de sucesso |

**Sub-props de cada campo:**

| Prop | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único |
| `type` | `string` | `text`, `email`, `phone`, `select`, `textarea` |
| `label` | `string` | Rótulo do campo |
| `placeholder` | `string` | Texto placeholder |
| `required` | `boolean` | Obrigatório |
| `options` | `string` | Opções (para select, separadas por vírgula) |

---

### 18. Lista / Menu (`list`)
**Tamanho padrão:** 420×500 · **Renderer:** `ListRenderer` · **Painel:** `ListPropsPanel`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `listTitle` | `string` | `"Menu"` | Título da lista |
| `bgColor` | `string` | `"rgba(0,0,0,0.4)"` | Fundo |
| `borderRadius` | `number` | `16` | Arredondamento |
| `titleSize` | `number` | `18` | Tamanho do título |
| `titleColor` | `string` | `"#ffffff"` | Cor do título |
| `priceColor` | `string` | `"#6366f1"` | Cor dos preços |
| `showIcon` | `boolean` | `true` | Mostrar ícone |
| `showPrice` | `boolean` | `true` | Mostrar preço |
| `showDivider` | `boolean` | `true` | Separadores |
| `items` | `array` | (ver abaixo) | Itens da lista |

**Sub-props de cada item:**

| Prop | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único |
| `title` | `string` | Nome do item |
| `subtitle` | `string` | Descrição |
| `price` | `string` | Preço formatado |
| `icon` | `string` | Emoji/ícone |

---

### 19. Catálogo (`catalog`)
**Tamanho padrão:** 480×600 · **Renderer:** `CatalogRenderer` · **Painel:** `CatalogPropsPanel`

Grid de produtos com filtros e busca.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | `"Catálogo"` | Título |
| `titleColor` | `string` | `"#ffffff"` | Cor do título |
| `titleSize` | `number` | `24` | Tamanho do título |
| `bgColor` | `string` | `"rgba(0,0,0,0.5)"` | Fundo |
| `borderRadius` | `number` | `16` | Arredondamento |
| `columns` | `number` | `2` | Colunas do grid |
| `gap` | `number` | `12` | Espaçamento |
| `cardBgColor` | `string` | `"rgba(255,255,255,0.08)"` | Fundo dos cards |
| `cardBorderRadius` | `number` | `12` | Arredondamento dos cards |
| `accentColor` | `string` | `"#6366f1"` | Cor de destaque |
| `showPrice` | `boolean` | `true` | Mostrar preço |
| `showCategory` | `boolean` | `true` | Mostrar categoria |
| `showSearch` | `boolean` | `false` | Busca |
| `showCategoryFilter` | `boolean` | `false` | Filtro por categoria |
| `imageAspect` | `string` | `"4/3"` | Proporção das imagens |
| `priceColor` | `string` | `"#22c55e"` | Cor do preço |
| `nameSize` | `number` | `14` | Tamanho do nome |
| `priceSize` | `number` | `16` | Tamanho do preço |
| `items` | `array` | (ver abaixo) | Produtos |

**Sub-props de cada item:**

| Prop | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único |
| `name` | `string` | Nome do produto |
| `description` | `string` | Descrição |
| `price` | `string` | Preço |
| `image` | `string` | URL da imagem |
| `category` | `string` | Categoria |
| `badge` | `string` | Texto do badge (ex: "Novo") |
| `badgeColor` | `string` | Cor do badge |

---

### 20. Diretório de Lojas (`store`)
**Tamanho padrão:** 480×600 · **Renderer:** `StoreRenderer` · **Painel:** `StorePropsPanel`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | `"Lojas"` | Título |
| `titleColor` | `string` | `"#ffffff"` | Cor do título |
| `titleSize` | `number` | `28` | Tamanho do título |
| `bgColor` | `string` | `"rgba(0,0,0,0.6)"` | Fundo |
| `borderRadius` | `number` | `16` | Arredondamento |
| `columns` | `number` | `1` | Colunas |
| `gap` | `number` | `12` | Espaçamento |
| `cardBgColor` | `string` | `"rgba(255,255,255,0.08)"` | Fundo dos cards |
| `cardBorderRadius` | `number` | `12` | Arredondamento |
| `accentColor` | `string` | `"#6366f1"` | Destaque |
| `showCategory` | `boolean` | `true` | Mostrar categoria |
| `showHours` | `boolean` | `true` | Mostrar horário |
| `showPhone` | `boolean` | `true` | Mostrar telefone |
| `showFloor` | `boolean` | `true` | Mostrar andar |
| `showCategoryFilter` | `boolean` | `false` | Filtro por categoria |
| `showSearch` | `boolean` | `false` | Busca |
| `stores` | `array` | (ver abaixo) | Lista de lojas |

**Sub-props de cada loja:**

| Prop | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único |
| `name` | `string` | Nome |
| `logo` | `string` | URL do logo |
| `coverImage` | `string` | Imagem de capa |
| `gallery` | `string[]` | Galeria |
| `floor` | `string` | Andar/Piso |
| `category` | `string` | Categoria |
| `hours` | `string` | Horário |
| `phone` | `string` | Telefone |
| `description` | `string` | Descrição |
| `mapX`, `mapY` | `number` | Posição no mapa |
| `zone` | `string` | Zona/bloco |

---

### 21. Mapa (`map`)
**Tamanho padrão:** 400×500 · **Renderer:** `MapRenderer` · **Painel:** `MapPropsPanel`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `lat` | `number` | `-23.5505` | Latitude |
| `lng` | `number` | `-46.6333` | Longitude |
| `zoom` | `number` | `15` | Nível de zoom |
| `borderRadius` | `number` | `12` | Arredondamento |
| `label` | `string` | `""` | Texto sobre o mapa |
| `labelColor` | `string` | `"#ffffff"` | Cor do texto |
| `labelSize` | `number` | `14` | Tamanho do texto |

---

### 22. Redes Sociais (`social`)
**Tamanho padrão:** 420×80 · **Renderer:** `SocialRenderer` · **Painel:** `SocialPropsPanel`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `links` | `array` | (4 pré-definidos) | Lista de redes sociais |
| `iconSize` | `number` | `36` | Tamanho dos ícones |
| `gap` | `number` | `16` | Espaçamento |
| `showLabels` | `boolean` | `true` | Mostrar nomes |
| `layout` | `string` | `"horizontal"` | `horizontal` ou `vertical` |
| `bgEnabled` | `boolean` | `false` | Fundo habilitado |
| `bgColor` | `string` | `"rgba(0,0,0,0.3)"` | Cor do fundo |
| `borderRadius` | `number` | `16` | Arredondamento |
| `padding` | `number` | `12` | Espaçamento interno |

**Plataformas:** Instagram, Facebook, WhatsApp, E-mail, YouTube, TikTok, X/Twitter, LinkedIn, Telegram, Website.

---

## 📊 Categoria: Dados

### 23. Relógio (`clock`)
**Tamanho padrão:** 240×100 · **Renderer:** `ClockRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `format` | `string` | `"24h"` | `12h` ou `24h` |
| `showDate` | `boolean` | `true` | Mostrar data |
| `color` | `string` | `"#ffffff"` | Cor do texto |
| `fontSize` | `number` | `36` | Tamanho da fonte |

---

### 24. Clima (`weather`)
**Tamanho padrão:** 300×160 · **Renderer:** `WeatherRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `city` | `string` | `"São Paulo"` | Cidade |
| `units` | `string` | `"metric"` | Unidade de medida |
| `color` | `string` | `"#ffffff"` | Cor do texto |

---

### 25. Contagem Regressiva (`countdown`)
**Tamanho padrão:** 360×120 · **Renderer:** `ClockRenderer` · **Painel:** genérico

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `targetDate` | `string` | `""` | Data alvo (ISO) |
| `label` | `string` | `"Faltam"` | Rótulo |
| `color` | `string` | `"#ffffff"` | Cor |
| `fontSize` | `number` | `28` | Tamanho da fonte |

---

### 26. Número Animado (`animated-number`)
**Tamanho padrão:** 320×160 · **Renderer:** `AnimatedNumberRenderer` · **Painel:** `AnimatedNumberPropsPanel`

Contador com animação de incremento.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `number` | `1234` | Valor final |
| `prefix` | `string` | `""` | Prefixo (ex: "R$") |
| `suffix` | `string` | `""` | Sufixo (ex: "%") |
| `label` | `string` | `"Visitantes hoje"` | Descrição |
| `color` | `string` | `"#ffffff"` | Cor do número |
| `labelColor` | `string` | `"rgba(255,255,255,0.6)"` | Cor do label |
| `fontSize` | `number` | `64` | Tamanho do número |
| `labelSize` | `number` | `18` | Tamanho do label |
| `duration` | `number` | `2000` | Duração da animação (ms) |
| `useGrouping` | `boolean` | `true` | Separar milhares |

---

### 27. Avatar 3D (`avatar`)
**Tamanho padrão:** 500×500 · **Renderer:** `AvatarRenderer` · **Painel:** genérico

Assistente virtual 3D com animações.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `position` | `string` | `"center"` | Posição no quadro |
| `scale` | `number` | `1.5` | Escala |
| `animation` | `string` | `"idle"` | Animação ativa |
| `enabled` | `boolean` | `true` | Habilitado |
| `avatarUrl` | `string` | `"/models/avatar.glb"` | Modelo 3D |
| `animationsUrl` | `string` | `"/models/animations.glb"` | Arquivo de animações |
| `colors.shirt` | `string` | `"#1E3A8A"` | Cor da camisa |
| `colors.pants` | `string` | `"#1F2937"` | Cor da calça |
| `colors.shoes` | `string` | `"#000000"` | Cor dos sapatos |
| `frameY` | `number` | `0` | Offset vertical |
| `frameZoom` | `number` | `50` | Zoom do enquadramento |

---

## 🧩 Sistema de Páginas (Views)

O editor suporta múltiplas páginas internas. Cada elemento é atribuído a uma `viewId`.

| Conceito | Descrição |
|---|---|
| **View** | Página interna (`{ id, name, isDefault }`) |
| **Navegação** | Via `actionType: 'navigate'` nos botões |
| **Transições** | `fade`, `slide-left`, `slide-right`, `slide-up`, `zoom` |
| **Idle timeout** | Retorna à página padrão após inatividade (configurável) |
| **Fundo por página** | Cada view pode ter cor de fundo própria via `pageBgColors` |

---

## 🔄 Ações Disponíveis (Botões/Interações)

| Tipo | Descrição |
|---|---|
| `prompt` | Envia comando de texto para a IA |
| `url` | Abre URL externa |
| `navigate` | Navega para outra página interna |
| `whatsapp` | Abre WhatsApp com template |
| `webhook` | Envia dados para um endpoint externo |
| `ai_command` | Executa comando de IA pré-definido |

---

## 📁 Estrutura de Arquivos

```
src/editor/
├── types/
│   └── canvas.ts              # Tipos, defaults e reducer
├── canvas/
│   ├── ElementPalette.tsx      # Paleta de elementos (sidebar)
│   ├── FreeFormEditor.tsx       # Editor principal do canvas
│   ├── PropertiesPanel.tsx      # Painel de propriedades contextual
│   ├── PagesPanel.tsx           # Gerenciador de páginas/views
│   ├── PageVariablesContext.tsx  # Contexto de variáveis globais
│   ├── renderers/               # Componentes de renderização
│   │   ├── ElementRenderer.tsx  # Router de renderização
│   │   ├── TextRenderer.tsx
│   │   ├── ImageRenderer.tsx
│   │   ├── ButtonRenderer.tsx
│   │   ├── ... (27 renderers)
│   │   └── Placeholder.tsx      # Placeholder genérico
│   └── properties/              # Painéis de propriedades específicos
│       ├── FeedPropsPanel.tsx
│       ├── FormPropsPanel.tsx
│       ├── CatalogPropsPanel.tsx
│       ├── ... (12 painéis)
│       └── shared.tsx           # Componentes compartilhados
└── templates/
    └── freeFormTemplates.ts     # Templates pré-configurados
```

---

*Documentação gerada automaticamente a partir do código-fonte do projeto.*
