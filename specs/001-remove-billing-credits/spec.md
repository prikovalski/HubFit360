# Feature Specification: Remover cobrança e créditos

**Feature Branch**: `001-remove-billing-credits`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Remover do HubFit360 todo o sistema de cobrança e créditos, tornando o projeto um open source de portfólio sem nenhuma monetização. Todas as funcionalidades de avaliação devem continuar funcionando para qualquer usuário cadastrado, sem gate de pagamento."

## Contexto

O HubFit360 deixa de ser um produto comercial e passa a ser um projeto open source de
portfólio. Hoje existem três camadas de monetização entrelaçadas com as funcionalidades:

| Avaliação | Hoje (sem pagar) | Hoje (pago com crédito) |
|---|---|---|
| Composição corporal (fotos/medidas) | Relatório básico (já usa IA para reavaliação) | "Upgrade premium": análise detalhada por IA (1 crédito) |
| Pollock 7 dobras | Completa, gratuita, sem IA | — |
| Big Five | Bloqueada sem crédito | Criação consome 1 crédito e gera análise por IA |
| TDAH (ASRS-18 / DIVA 2.0) | Bloqueada sem crédito | Criação consome 1 crédito; "upgrade premium" com IA consome mais 1 |

Além disso: compra de créditos via plataforma de pagamento externa (Hotmart), catálogo de
produtos, histórico de transações, saldo exibido na interface, 1 crédito de boas-vindas no
cadastro, e mensagens de "compre créditos"/"faça upgrade" em várias telas e no PDF.

## Clarifications

### Session 2026-10-30

- Q: Como tratar o custo da IA sem créditos? → A: Liberar sem limite (sem cota por usuário).
- Q: Destino dos dados de cobrança existentes? → A: Excluir definitivamente.
- Q: Big Five pode gerar a análise detalhada depois da criação? → A: Não; só no momento da
  criação. Se falhar ou a IA não estiver configurada, o relatório mostra os escores e indica
  que a análise está indisponível.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar qualquer avaliação sem créditos (Priority: P1)

Um usuário recém-cadastrado cria avaliações Big Five, TDAH (ASRS-18 e DIVA 2.0),
composição corporal e Pollock sem que o sistema verifique, consuma ou mencione créditos.

**Why this priority**: Hoje Big Five e TDAH ficam inacessíveis quando o crédito de
boas-vindas acaba; sem isso o projeto de portfólio não é demonstrável.

**Independent Test**: Criar uma conta nova e concluir duas avaliações de cada tipo em
sequência; todas devem ser criadas e exibidas sem bloqueio.

**Acceptance Scenarios**:

1. **Given** um usuário cadastrado, **When** ele envia uma avaliação Big Five, **Then** a
   avaliação é criada e o relatório exibido, sem verificação de saldo.
2. **Given** um usuário que já criou várias avaliações TDAH, **When** ele cria outra,
   **Then** a criação ocorre normalmente.
3. **Given** qualquer formulário de avaliação, **When** é exibido, **Then** não há aviso de
   consumo de crédito nem botão desabilitado por falta de saldo.

---

### User Story 2 - Relatório completo para todos (Priority: P1)

O usuário acessa o relatório completo de cada avaliação, incluindo a análise detalhada por
IA, sem etapa de "upgrade" pago e sem distinção básico/premium visível.

**Why this priority**: É o principal diferencial técnico a ser mostrado no portfólio.

**Independent Test**: Abrir o relatório de uma avaliação de composição corporal e de uma
TDAH e obter a análise detalhada sem pagamento.

**Acceptance Scenarios**:

1. **Given** uma avaliação de composição corporal, **When** o usuário abre o relatório,
   **Then** ele consegue obter a análise detalhada por IA sem custo e sem a palavra
   "premium"/"upgrade".
2. **Given** uma avaliação TDAH, **When** o usuário abre o relatório, **Then** ele consegue
   obter a análise detalhada sem custo.
3. **Given** uma avaliação antiga que estava como "básica", **When** o usuário a abre,
   **Then** ele pode gerar a análise detalhada para ela.
4. **Given** um relatório exportado em PDF, **When** gerado, **Then** inclui todas as seções
   (incluindo recomendações) e nenhum texto sobre pagamento.
5. **Given** um usuário que já gerou várias análises detalhadas no dia, **When** pede outra,
   **Then** ela é gerada normalmente (sem cota de uso).

---

### User Story 3 - Interface sem qualquer menção a cobrança (Priority: P2)

Nenhuma tela, menu, modal, texto de ajuda, e-mail ou PDF menciona créditos, saldo, compra,
preço, pagamento, Hotmart, premium ou upgrade.

**Why this priority**: Um projeto de portfólio com telas de compra quebradas passa uma
impressão de produto inacabado.

**Independent Test**: Navegar por todas as telas logadas e deslogadas e exportar um PDF de
cada tipo; nenhum termo de cobrança aparece.

**Acceptance Scenarios**:

1. **Given** um usuário logado, **When** visualiza o menu lateral e o cabeçalho do painel,
   **Then** não há saldo nem botão "comprar créditos".
2. **Given** a tela de exclusão de conta, **When** exibida, **Then** a lista de dados
   removidos não cita "histórico de pagamentos".
3. **Given** o cadastro de um novo usuário, **When** concluído, **Then** nenhuma mensagem
   sobre crédito de boas-vindas é exibida.

---

### User Story 4 - Remover a infraestrutura de cobrança (Priority: P2)

Mantenedores e visitantes do repositório não encontram código, serviços, endpoints ou
estruturas de dados de cobrança, e não existe nenhum endpoint público capaz de alterar
saldos ou registrar compras.

**Why this priority**: Elimina a vulnerabilidade conhecida do webhook de pagamento (permite
forjar compras), reduz superfície de ataque e deixa o código legível para quem avalia o
portfólio.

**Independent Test**: Buscar no repositório por termos de cobrança e chamar os endpoints
antigos de pagamento/créditos; a busca não encontra código ativo e os endpoints não existem.

**Acceptance Scenarios**:

1. **Given** o sistema publicado, **When** alguém chama o antigo endpoint de webhook de
   pagamento, **Then** ele não existe mais.
2. **Given** o repositório, **When** se procura por "credit", "crédito", "hotmart",
   "premium" ou "upgrade" no código-fonte ativo, **Then** não há ocorrências relacionadas a
   cobrança (migrations históricas são exceção).
3. **Given** a exclusão de conta de um usuário, **When** executada, **Then** todos os dados
   pessoais dele continuam sendo removidos e o processo não falha por ausência das
   estruturas de crédito.

---

### User Story 5 - Tratamento dos dados de cobrança existentes (Priority: P3)

Os dados já gravados de saldos, transações de crédito, produtos e compras recebem um
destino definido.

**Why this priority**: Há dados pessoais de compradores (e-mail, transação) sem finalidade
após o fim da cobrança; mantê-los contraria o princípio de minimização da LGPD.

**Independent Test**: Após a migração, verificar que os dados de cobrança tiveram o
destino definido e que nenhuma avaliação existente foi perdida.

**Acceptance Scenarios**:

1. **Given** dados de cobrança existentes (saldos, transações de crédito, produtos e
   compras externas), **When** a mudança é aplicada, **Then** esses dados e suas estruturas
   são excluídos definitivamente.
2. **Given** avaliações existentes de qualquer tipo, **When** a mudança é aplicada, **Then**
   todas continuam acessíveis aos seus donos, com os mesmos resultados.

---

### Edge Cases

- Avaliação Big Five/TDAH que estava no meio do processo de criação no momento da
  publicação: deve ser concluída normalmente ou poder ser refeita sem bloqueio.
- Avaliação antiga cujo upgrade foi pago: continua exibindo a análise já gerada; não deve
  ser gerada de novo automaticamente.
- Falha do serviço de IA ao gerar análise detalhada: o relatório com os cálculos continua
  disponível e o usuário vê mensagem clara e pode tentar de novo.
- Serviço de IA não configurado (ex.: alguém clonou o projeto open source sem chave): as
  avaliações e cálculos continuam funcionando; a análise por IA aparece como indisponível.
- Usuário que tinha saldo de créditos comprados: não há reembolso nem aviso no app
  (comunicação, se necessária, é feita fora do sistema).
- Cache/sessão antiga do navegador ainda tentando consultar saldo: não deve quebrar a tela.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir a criação de avaliações Big Five, TDAH (ASRS-18 e DIVA
  2.0), composição corporal e Pollock por qualquer usuário autenticado, sem verificar nem
  consumir saldo.
- **FR-002**: O sistema MUST disponibilizar a análise detalhada por IA (hoje "premium") de
  composição corporal, Big Five e TDAH a qualquer usuário autenticado sem pagamento,
  respeitando a política de uso definida em FR-003. Para Big Five, a análise é gerada
  exclusivamente no momento da criação; não há geração posterior.
- **FR-003**: O sistema MUST NOT impor cota de uso de análises por IA por usuário. A
  proteção contra rajadas automatizadas já existente (limite de requisições por minuto)
  permanece, pois não é cota de uso e é exigida pela constituição.
- **FR-004**: O sistema MUST NOT exibir em nenhuma tela, modal, menu, notificação ou PDF os
  conceitos de crédito, saldo, compra, preço, pagamento, plano, premium ou upgrade.
- **FR-005**: O sistema MUST deixar de conceder crédito de boas-vindas no cadastro, mantendo
  inalterada a criação de perfil, papéis e perfil de paciente.
- **FR-006**: O sistema MUST remover os pontos de entrada de compra, confirmação de
  transação, consulta de saldo e consumo de crédito, incluindo o webhook de pagamento.
- **FR-007**: A exclusão de conta MUST continuar removendo todos os dados pessoais do
  usuário e MUST NOT depender de estruturas de cobrança.
- **FR-008**: Avaliações existentes MUST permanecer acessíveis com os mesmos resultados; as
  análises detalhadas já geradas MUST ser preservadas.
- **FR-009**: O PDF de qualquer avaliação MUST incluir todas as seções do relatório,
  incluindo recomendações, sem condicionar a conteúdo pago.
- **FR-010**: Os dados de cobrança existentes (saldos, transações de crédito, produtos e
  compras externas) e suas estruturas MUST ser excluídos definitivamente.
- **FR-011**: A documentação do projeto (README) MUST descrever o projeto como open source
  de portfólio, sem referência a planos ou compra, e listar as configurações necessárias
  para rodá-lo (incluindo a de IA).
- **FR-012**: A constituição do projeto MUST ser emendada para refletir o fim do princípio
  de créditos e pagamentos, preservando a regra de que falhas da IA não podem degradar o
  restante do relatório.

### Key Entities *(include if feature involves data)*

- **Avaliação** (composição corporal, Pollock, Big Five, TDAH): permanece. O atributo de
  nível (básico/premium) deixa de ter significado comercial; o que importa é se a análise
  detalhada já foi gerada.
- **Análise detalhada por IA**: conteúdo textual gerado para uma avaliação; passa a ser
  gratuita e sujeita apenas à política de uso de IA.
- **Saldo de créditos, Transação de crédito, Produto à venda, Compra externa**: deixam de
  existir no domínio; destino dos dados conforme User Story 5.
- **Usuário / Perfil de paciente**: permanecem; o cadastro não cria mais saldo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos tipos de avaliação (4) podem ser criados por uma conta nova pelo
  menos 3 vezes seguidas sem bloqueio.
- **SC-002**: 0 ocorrências de termos de cobrança (crédito, saldo, compra, preço,
  pagamento, premium, upgrade, Hotmart) em telas, PDFs e código-fonte ativo.
- **SC-003**: 0 endpoints ativos relacionados a pagamento, saldo ou consumo de crédito.
- **SC-004**: 100% das avaliações existentes antes da mudança continuam abrindo com os
  mesmos resultados numéricos.
- **SC-005**: O usuário obtém o relatório completo, incluindo análise detalhada, em no
  máximo 1 ação a partir da tela do relatório.
- **SC-006**: Uma pessoa que clona o repositório consegue rodar o projeto seguindo apenas
  o README, sem configurar nenhum serviço de pagamento.

## Assumptions

- A análise detalhada continua sob demanda (botão "Gerar análise detalhada") para
  composição corporal e TDAH, e automática na criação para Big Five, como hoje; muda apenas
  a ausência de custo.
- A mantenedora aceita o risco de custo de IA sem cota no app publicado; pode reavaliar
  em feature futura.
- Antes da exclusão definitiva dos dados de cobrança, a mantenedora faz backup se quiser
  guardá-los fora do sistema.
- Não haverá reembolso nem comunicação in-app a quem possuía créditos comprados.
- As migrations históricas do repositório não são reescritas; a remoção acontece por uma
  nova migration.
- A conta na plataforma de pagamento externa e os segredos de configuração correspondentes
  serão desativados manualmente pela mantenedora fora do código.
- A correção do uso de identificador vindo da requisição (em vez do usuário autenticado)
  nas funções de criação é tratada em feature própria, exceto onde o código tocado por esta
  feature já precisar ser reescrito.
- Pollock já é gratuita e sem IA; muda apenas se houver texto de cobrança associado.
