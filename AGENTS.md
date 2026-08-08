# AGENTS.md

## Projeto

Ferramenta web minimalista para criação de tablaturas de violão.

O usuário deve conseguir criar uma tablatura diretamente em um editor visual e exportá-la em PDF.

## Objetivo

Criar uma experiência simples:

1. Acessar a landing page.
2. Entrar no editor.
3. Digitar as casas e tempos diretamente na tablatura.
4. Visualizar a tablatura em tempo real.
5. Exportar a tablatura para PDF.

Não criar funcionalidades desnecessárias na primeira versão.

## Páginas

### Landing Page

Página simples apresentando a ferramenta.

Deve conter:

* Nome/logo do projeto
* Breve descrição
* Exemplo visual de uma tablatura
* Botão "Criar tablatura"

### Editor

Interface principal da aplicação.

Layout:

* Editor central
* Tablatura visível diretamente na tela
* Campos/interações para inserir casas
* Controle de tempo/duração das notas
* Botão para adicionar/remover compassos quando necessário
* Botão "Exportar PDF"

A edição deve ser o mais próxima possível da visualização final da tablatura.

## Editor de Tablatura

A tablatura deve representar as 6 cordas:

```text
e|----------------|
B|----------------|
G|----------------|
D|----------------|
A|----------------|
E|----------------|
```

O usuário deve conseguir posicionar notas e informar as casas diretamente sobre a estrutura da tab.

A representação visual deve atualizar conforme o usuário edita.

Priorizar:

* Digitação rápida
* Navegação pelo teclado
* Interface limpa
* Poucos controles
* Feedback visual claro

## Dados

Manter a tablatura em um modelo simples em memória.

Exemplo conceitual:

```ts
type Tab = {
  tempo: number;
  measures: Measure[];
};

type Measure = {
  notes: Note[];
};

type Note = {
  string: number;
  fret: number;
  duration: number;
};
```

Não é necessário banco de dados na V1.

Não é necessário sistema de autenticação.

Não é necessário salvar projetos na nuvem.

## Exportação PDF

O PDF deve representar a tablatura da mesma forma que ela aparece no editor.

A exportação deve:

* Preservar alinhamento
* Preservar casas e tempos
* Gerar múltiplas páginas quando necessário
* Ser executada pelo navegador sempre que possível

Evitar backend apenas para gerar PDF.

## Tecnologia

Preferencialmente:

* Next.js
* TypeScript
* Tailwind CSS
* React
* Biblioteca de PDF apenas se necessária

Deploy:

* Vercel

A aplicação deve ser majoritariamente client-side.

## Design

Estética minimalista e limpa.

Princípios:

* Fundo claro
* Tipografia simples
* Poucas cores
* Bordas discretas
* Espaçamento generoso
* Sem excesso de cards ou elementos decorativos
* Editor como elemento principal da interface

A tablatura deve ser o foco visual.

## Estrutura sugerida

```text
src/
├── app/
│   ├── page.tsx
│   └── editor/
│       └── page.tsx
│
├── components/
│   ├── TabEditor.tsx
│   ├── TabMeasure.tsx
│   ├── TabString.tsx
│   └── ExportPdfButton.tsx
│
├── models/
│   └── tab.ts
│
└── lib/
    └── pdf.ts
```

## Escopo da V1

Implementar somente:

* Landing page
* Editor de tablatura
* 6 cordas
* Inserção de casas
* Controle básico de tempo/duração
* Visualização em tempo real
* Edição por teclado
* Exportação para PDF
* Layout responsivo
* Deploy na Vercel

## Fora do escopo

Não implementar inicialmente:

* Login
* Banco de dados
* Contas de usuário
* Colaboração
* Compartilhamento online
* Marketplace
* Biblioteca de músicas
* Reprodução de áudio
* IA
* Editor de partitura tradicional
* Aplicativo mobile

## Regra principal

A ferramenta deve parecer um **editor de texto para tablaturas**, e não um software musical complexo.

Sempre priorizar simplicidade, velocidade de edição e fidelidade entre o editor e o PDF.
