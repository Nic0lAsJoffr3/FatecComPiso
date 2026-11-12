# FatecComPiso
Projeto feito com IA como meme interno, não é um projeto serio!

## Arquivos

- `index.html`: estrutura da página e carregamento dos arquivos.
- `style.css`: estilos da interface.
- `js/core.js`: configurações e funções utilitárias.
- `js/world.js`: mundo, personagens e movimentação.
- `js/render.js`: desenho do mundo e dos personagens.
- `js/game.js`: atualização, controles e renderização principal.
- `js/expansion.js`: sistemas adicionais do jogo.

## Policia

O nivel de procurado considera a gravidade dos crimes, nao a quantidade de testemunhas do mesmo incidente. A resposta escala de patrulhas e unidades pesadas (1-6 estrelas) para transportes SWAT e helicoptero (7-10), acumulando unidades a cada aumento de nivel. As unidades pesadas usam fuzis e nao montarias. O helicoptero informa a ultima posicao avistada e so recebe dano de armas de longo alcance. A Guarda-Marinha patrulha a praia no canto esquerdo do mapa.

O mapa e o minimapa destacam apenas locais funcionais, com marcadores diferentes para personagens especiais, policiais em busca e aliados. A loja de roupas permite comprar e vestir novos conjuntos; os pedestres tambem variam as roupas de acordo com sua classe social.

A expansão para oeste preserva a cidade original e acrescenta uma cidade desértica de baixa renda, com casas, armazém e banco com serviço de depósito/saque. Ao sul dela há uma área militar restrita, acessível por uma única estrada, com quartel, torres de vigia, blindados e comboios que percorrem o mapa.

O deserto agora cobre toda a faixa a oeste da cidade, com cactos, arbustos, rochas, camelos, raposas e escorpiões. Tubarões circulam em águas profundas ao redor da ilha, longe da área de nadadores. A cidade desértica fica isolada no extremo oeste e tem uma única estrada de ligação com a cidade principal; nela há um quartel com estacionamento próprio e policiais de uniforme cáqui. A Guarda-Marinha fica junto à divisa dos biomas e aumenta suas patrulhas de barcos conforme o nível de procurado.

Com 10 estrelas, novos crimes acionam o Exército, que mobiliza soldados, generais, carros militares, caminhões e tanques. A base militar foi ampliada com arsenal, estacionamento de blindados e duas patrulhas que percorrem as cidades; as estrelas ficam vermelhas enquanto o Exército estiver mobilizado. AK-47 e fuzis podem ser encontrados na área militar.

Um rio nadável divide o deserto da cidade, com uma única ponte na estrada de ligação. As ruas da cidade desértica formam uma malha retangular e usam a mesma geometria no cenário, no mapa e no minimapa; as fachadas mantêm o estilo visual da cidade original. Viaturas perseguem o jogador também fora das ruas, e um tanque o persegue quando o Exército é mobilizado com 10 estrelas vermelhas. O dano de colisão causado ao dirigir varia com a velocidade e pode ser fatal em alta velocidade. O aviso do helicóptero fica separado do relógio.

Os pedestres variam entre homens e mulheres jovens, adultos e idosos, com silhuetas e penteados diferentes. Algumas mulheres adultas podem aparecer grávidas. Felipe, Wagner, Evangelista, João Paulo, Psicóloga, Nicolas e Zaneti têm gênero e aparência definidos.
