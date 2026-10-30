# Contracts: Interface

Textos em pt-BR. Proibidos em qualquer tela, toast, modal ou PDF: crédito(s), saldo,
comprar/compra, preço, pagamento, plano, premium, upgrade, Hotmart.

## Navegação e painel

- Sidebar e cabeçalhos dos painéis: sem saldo, sem widget de créditos, sem botão de compra.
- Blocos informativos em `AppContent` e `LoggedPageLayout`: substituir o texto de créditos
  por uma descrição neutra das avaliações disponíveis (ou remover o bloco).
- Listas de avaliações: o status exibe "Concluída" / "Análise detalhada" — nunca
  "Pago"/"Pendente".

## Formulários (Big Five, TDAH ASRS-18, DIVA 2.0)

- Botão de envio habilitado apenas por validação do formulário, nunca por saldo.
- Sem avisos "esta avaliação consome 1 crédito".

## Relatório de composição corporal e TDAH

| Estado | O usuário vê |
|---|---|
| Análise detalhada ainda não gerada | Card "Gerar análise detalhada" com breve descrição e botão. Sem preço/custo. |
| Gerando | Botão desabilitado com indicador "Gerando análise…" |
| Falha | Toast de erro claro ("Não foi possível gerar a análise agora. Tente novamente.") e o card volta ao estado inicial |
| Gerada | A análise detalhada + aviso "não substitui avaliação profissional" |

## Relatório Big Five

| Estado | O usuário vê |
|---|---|
| Com análise | Escores + análise detalhada + aviso profissional |
| Sem análise (IA falhou ou indisponível) | Escores + texto neutro "Análise detalhada indisponível para esta avaliação." |

Sem badge "Premium" em relatórios nem no dashboard Big Five.

## PDF

- Composição corporal: seção de recomendações sempre incluída.
- TDAH: análise detalhada incluída quando existir; sem condicionar a pagamento.

## Exclusão de conta

- A lista de dados removidos não cita "histórico de pagamentos".
