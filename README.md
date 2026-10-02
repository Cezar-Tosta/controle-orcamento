# Controle de Orçamento

Controle de gastos pessoal que roda inteiramente no seu celular — sem
servidor, sem conta, sem internet depois de instalado. Todos os dados ficam
só no seu aparelho (IndexedDB local).

## Funcionalidades

- **Categorias** de gastos personalizáveis (nome + cor).
- **Gastos**: descrição, valor, categoria e data, com filtro por mês.
- **Orçamento mensal com média diária automática**: você informa o valor
  total disponível (ex: R$ 2.400) e o dia do cadastro; o app calcula quanto
  pode gastar por dia até o fim do mês e mostra o quanto você está **acima
  ou abaixo** dessa média, acumulado.
- **Cofrinho (metas de poupança) com prioridade**: cadastre metas, ordene por
  prioridade e acompanhe o progresso. Quando seu saldo acumulado (economia
  em relação à média diária) cobre o valor restante da meta de maior
  prioridade, o app avisa qual meta dá para quitar.
- **Dashboard com gráficos**: gastos por categoria (donut) e gasto diário
  vs. média (barras, verde quando dentro da média e vermelho quando acima),
  com filtro por mês.
- **Tema claro/escuro**, salvo no aparelho.
- **Backup/restauração**: exporte todos os dados em um `.json` e importe em
  outro celular, ou guarde uma cópia de segurança.
- **PWA instalável e offline**: depois de abrir uma vez, funciona sem
  internet — ótimo para registrar gastos no cartão de crédito, mercado etc.
  sem depender de sinal.

## Rodando localmente

Requer [Node.js 22+](https://nodejs.org).

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (ex: `http://localhost:5173/controle-orcamento/`).

Outros comandos:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # oxlint
npm run format      # oxfmt -w
npm run test        # vitest
npm run build       # build de produção (gera dist/)
npm run preview     # serve o build de produção localmente
```

## Instalando no celular (com ou sem internet depois)

1. Publique o projeto (veja "Deploy" abaixo) ou rode `npm run dev -- --host`
   e acesse pelo celular na mesma rede Wi-Fi.
2. Abra o link no navegador do celular (Chrome/Safari).
3. Toque em **"Adicionar à tela inicial"** (Android) ou **"Adicionar à
   Tela de Início"** (iOS, no menu de compartilhar do Safari).
4. Pronto — o app abre como um aplicativo normal, com ícone próprio, e
   depois do primeiro carregamento funciona **sem internet**.

## Deploy (GitHub Pages)

Este repositório já vem com um workflow (`.github/workflows/deploy.yml`)
que builda e publica automaticamente no GitHub Pages a cada push na branch
`main`.

Para ativar:

1. No GitHub, vá em **Settings → Pages** e em "Build and deployment" escolha
   **Source: GitHub Actions**.
2. **Importante:** o GitHub Pages gratuito só publica sites de
   repositórios **públicos**. Se quiser manter o repositório privado, use
   Vercel ou Netlify (ambos aceitam repositório privado no plano grátis) e
   ajuste a opção `base` em `vite.config.ts` conforme a hospedagem.
3. Depois do primeiro deploy, a URL fica em
   `https://<seu-usuario>.github.io/controle-orcamento/`.

Se o nome do repositório no GitHub for diferente de `controle-orcamento`,
atualize a constante `BASE_PATH` em `vite.config.ts` e o `start_url`/`scope`
do manifesto para bater com o novo caminho.

## Stack técnica

- **React 19 + TypeScript** (strict, `verbatimModuleSyntax`,
  `noUncheckedIndexedAccess` etc.)
- **Vite 8** + **vite-plugin-pwa** (service worker, manifesto, instalação)
- **Tailwind CSS 4** (mobile-first, modo escuro)
- **Dexie.js** (IndexedDB) — toda a persistência é local, sem backend
- **Recharts** para os gráficos do dashboard
- **Vitest** para os testes da lógica de orçamento (`src/utils/budget.ts`)
- **oxlint** / **oxfmt** para lint e formatação

## Ideias para evoluir

- Gastos recorrentes (assinaturas, contas fixas).
- Notificações locais quando o gasto do dia passar da média.
- Múltiplas moedas.
- Sincronização entre aparelhos (exigiria um backend; hoje os dados são
  100% locais por design, para simplicidade e privacidade).
