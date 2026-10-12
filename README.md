# Saga Studio

Projeto: Juramentos do Destino Studio

Crie uma aplicação web responsiva chamada Juramentos do Destino Studio, um organizador editorial e criativo para uma autora que está desenvolvendo uma saga de dez livros.

1. Identidade visual

- Interface elegante, feminina, literária e moderna.

- Tema escuro com preto, vinho, magenta, rosa, roxo e detalhes em verde-água.

- Cards sofisticados, ícones delicados, bordas suaves e excelente legibilidade.

- Layout adaptável a celulares Android e computadores.

- Navegação lateral no computador e menu compacto no celular.

- Todo o conteúdo da interface em português brasileiro.

2. Dashboard

Criar uma página inicial com:

- Saudação personalizada.

- Resumo dos livros e do progresso de escrita.

- Atalhos para personagens, casais, capítulos, cronologia e estúdio editorial.

- Projetos recentes e tarefas pendentes.

- Uma área visual de destaque para a saga.

3. Biblioteca

Criar dez registros iniciais para os livros:

Chama, Maré, Luz, Lua, Vida, Terra, Oceano, Neon, Destino e Aurora.

Cada registro deve ter capa, título, subtítulo, sinopse, protagonistas, número de capítulos, status, gênero, paleta de cores e informações editoriais.

Permitir adicionar, editar, pesquisar e organizar livros.

4. Personagens e relacionamentos

Criar fichas editáveis com nome, apelidos, idade, aparência, personalidade, qualidades, defeitos, medos, gostos, desgostos, família, passado, profissão, estilo de roupa, frases marcantes e evolução narrativa.

Permitir associar personagens a livros, casais e outros personagens.

5. Escrita e capítulos

Criar uma área para capítulos com título, número, resumo, acontecimentos, personagens envolvidos e status de escrita. Incluir busca, filtros e acompanhamento de progresso.

6. Universo e cronologia

Criar páginas para locais, organizações, regras da magia, transformações, eventos históricos e linha do tempo. Permitir relacionar esses elementos aos livros e personagens.

7. Moodboards e referências

Criar galerias visuais para capas, figurinos, paletas, objetos simbólicos, referências cinematográficas e ilustrações. Permitir adicionar imagens, legendas e tags.

8. Estúdio Editorial — prioridade especial

Criar uma área chamada “Meu Livro Físico”, vinculada a cada livro da biblioteca.

Ela deve incluir:

- Editor visual da capa frontal, contracapa e lombada.

- Campos para título, subtítulo, autora e sinopse.

- Upload de imagens próprias.

- Mockup tridimensional ou perspectiva de livro, com frente, lombada e páginas visíveis.

- Controles de formato, espessura aproximada e cor do bloco de páginas.

- Simulação de capa dura, acabamentos decorativos, marcador de página e detalhes gráficos.

- Pré-visualização de páginas internas com abertura de capítulo, numeração, margens, cabeçalhos e ilustrações.

- Alternância entre capa, livro em perspectiva e miolo.

- Opção de salvar diferentes versões do projeto.

- Indicação clara de que o mockup é uma simulação visual, não um arquivo final pronto para impressão.

9. Dados e funcionamento

Criar navegação funcional, formulários, filtros, estados vazios e ações de adicionar, editar e excluir com confirmação.

Preparar uma estrutura de dados persistente para livros, personagens, relacionamentos, capítulos, locais, eventos, imagens e projetos editoriais. Se a persistência exigir um serviço externo, explicar como configurá-lo antes de depender dele.

Não inventar informações narrativas que a autora ainda não forneceu. Usar exemplos claramente identificados como editáveis.

10. Primeira entrega

Começar por um protótipo navegável, com dashboard, biblioteca, ficha de livro e uma primeira versão do Estúdio Editorial. Priorizar a experiência mobile. Não implementar funcionalidades falsas: indicar claramente o que já funciona e o que ainda precisa ser configurado.

O objetivo é criar um espaço de trabalho pessoal que acompanhe a saga desde o planejamento até a preparação dos livros físicos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22fb3927-3134-4afe-bf60-056bc86ca116).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
