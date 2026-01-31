# 💰 App Financeiro - Documentação Técnica

Este documento fornece uma visão detalhada do funcionamento, regras de negócio e fluxos do aplicativo de controle financeiro.

---

## 1. Visão Geral do Projeto

O **App Financeiro** é uma solução mobile para controle de finanças pessoais, projetada para usuários que buscam simplicidade e eficiência. Ele resolve o problema de desorganização financeira permitindo o registro rápido de gastos, planejamento de orçamento e acompanhamento de contas futuras.

### Principais Funcionalidades
- **Controle de Caixa**: Registro de receitas e despesas com saldo em tempo real.
- **Orçamento (Metas)**: Definição de limites de gastos por categoria.
- **Contas a Pagar**: Gestão de boletos futuros com lembretes automáticos.
- **Relatórios**: Visualização clara do fluxo financeiro mensal.

---

## 2. Fluxo Geral do Aplicativo

O aplicativo segue um fluxo linear e seguro:

1.  **Inicialização (Splash)**:
    - O app verifica silenciosamente se existe uma sessão válida do Supabase armazenada no dispositivo.
    - **Com Sessão**: Redireciona automaticamente para a `Home`.
    - **Sem Sessão**: Redireciona para a tela de `Login`.

2.  **Fluxo de Autenticação**:
    - O usuário deve realizar Login ou Cadastro para acessar os dados.
    - Não existe modo "visitante" (offline-first sem conta) para garantir a segurança e backup dos dados na nuvem.

3.  **Navegação Principal (Home)**:
    - A tela inicial é o "Dashboard", apresentando resumo do mês, lista de últimas transações e acesso rápido às funcionalidades (Nova Transação, Contas, Metas, Relatórios).

---

## 3. Autenticação

O sistema utiliza o **Supabase Auth** para gestão de identidade.

- **Cadastro**: Requer e-mail e senha. Cria um usuário único no banco de dados.
- **Login**: Autentica as credenciais e retorna um *token* de sessão (JWT).
- **Sessão**: O token é persistido localmente no dispositivo. O usuário permanece logado até que o token expire ou ele clique explicitamente em "Sair".
- **Logout**: Encerra a sessão local e redireciona para a tela de login. Requer confirmação do usuário para evitar saídas acidentais.

---

## 4. Fluxo de Transações

As transações são o núcleo do sistema.

### Criar Transação
- **Tipos**: Receita (entrada) ou Despesa (saída).
- **Validações**:
    - Descrição é obrigatória.
    - Valor deve ser maior que zero.
    - Data não pode ser futura (exceto em Contas a Pagar).
- **Limites**:
    - **Quantidade**: Máximo de **200 transações por mês** (regra de negócio para incentivar o uso consciente e performance).
    - **Arredondamento**: Valores são arredondados para 2 casas decimais.

### Editar Transação
- Permite alterar **Valor**, **Descrição** e **Data**.
- A edição reflete imediatamente nos cálculos de saldo do mês correspondente à nova data.

### Exclusão
- Requer confirmação explícita (Alerta).
- Remove o registro permanentemente e recalcula o saldo.

---

## 5. Filtro por Mês

A navegação temporal é centralizada na Home.

- **Controle**: Setas `<` e `>` permitem navegar entre meses.
- **Comportamento**: Ao trocar o mês:
    1.  A lista de transações é filtrada.
    2.  Os resumos (Receita/Despesa/Saldo) são recalculados baseados *apenas* no mês selecionado.
    3.  O status do Orçamento (Metas) também é atualizado para refletir o mês visível.

---

## 6. Resumos e Cálculos

O sistema realiza cálculos em tempo real no dispositivo (Client-side calculation) para feedback instantâneo, mas valida a integridade no Backend.

- **Receitas**: Soma de todas as transações do tipo `income` no mês.
- **Despesas**: Soma de todas as transações do tipo `expense` no mês.
- **Saldo**: `Receitas - Despesas`.
- **Arredondamento**: Regra matemática padrão (`Math.round`). Ex: 10.555 vira 10.56.

> **Nota**: Transações de meses diferentes NUNCA se misturam nos totais da tela inicial.

---

## 7. Categorias

As categorias são fixas para garantir padronização nos relatórios:

- 🍔 **Alimentação**
- 🚌 **Transporte**
- 🎭 **Lazer**
- 💡 **Contas** (Energia, Água, Internet, etc.)
- 🏥 **Saúde**
- 📦 **Outros**

> Ao pagar uma "Conta a Pagar", ela é automaticamente categorizada como **Contas**.

---

## 8. Contas a Pagar

Módulo dedicado a compromissos futuros (Passivos).

- **Diferença**: Uma "Conta a Pagar" **NÃO** afeta o saldo até ser efetivamente paga. Ela é apenas um lembrete.
- **Fluxo de Pagamento**:
    1.  Usuário clica em "Pagar".
    2.  **Modal de Confirmação**: O app pergunta "Pagou hoje ou em outra data?".
    3.  **Date Picker**: Permite selecionar a data real do pagamento (útil para pagamentos retroativos).
    4.  **Conclusão**: A conta sai da lista de pendências e vira uma **Despesa** na lista de Transações.
- **Automação**: O sistema cancela automaticamente qualquer notificação agendada para aquela conta assim que o pagamento é registrado.

---

## 9. Notificações

O app utiliza o sistema de notificações locais do dispositivo (Expo Notifications).

- **Gatilho**: Agendadas automaticamente ao criar uma Conta a Pagar.
- **Horário**: **09:00 AM** do dia do vencimento.
- **Cancelamento**: Se a conta for paga antes do vencimento, a notificação é cancelada para não incomodar o usuário.
- **Regra**: Não são enviadas notificações para contas já vencidas no momento do cadastro.

---

## 10. Sincronização e Dados

- **Backend**: Supabase (PostgreSQL).
- **Segurança (RLS)**: O banco utiliza *Row Level Security*. Um usuário jamais consegue ler ou editar dados de outro usuário, mesmo que tente via API direta. A segurança é garantida a nível de banco de dados.
- **Offline**: O app requer conexão para operações de escrita/leitura iniciais. (Suporte offline completo planejado para versões futuras).

---

## 11. Regras Importantes do Sistema

1.  **Imutabilidade de Histórico**: Não é possível alterar o log de "data de criação" original do registro no banco (apenas a data de referência da transação).
2.  **Proteção de Exclusão**: Categorias não podem ser excluídas pelo usuário.
3.  **Consistência de Data**: Ao pagar uma conta com data retroativa, ela aparecerá no mês correspondente àquela data, não necessariamente no mês atual.

---

## 12. Como Rodar o Projeto

### Pré-requisitos
- Node.js (LTS)
- Conta no Supabase

### Instalação
1.  Clone o repositório:
    ```bash
    git clone <url-do-repo>
    cd app-finaceiro
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure o Supabase:
    - Crie um projeto no Supabase.
    - Rode o script `supabase_schema.sql` no SQL Editor do Supabase.
    - Configure as chaves em `src/infra/supabase/client.ts`.

### Execução
```bash
npm start
```
- Pressione `a` para Android ou `i` para iOS.

---

## 13. Próximos Passos / Evolução

Funcionalidades mapeadas para o roadmap futuro:

- [ ] **Exportação**: Gerar relatórios em PDF/Excel.
- [ ] **Modo Offline**: Sincronização automática quando a internet voltar.
- [ ] **Recorrência no Servidor**: Migrar a lógica de transações recorrentes para o backend (Supabase Edge Functions).
- [ ] **Múltiplas Carteiras**: Gerenciar saldo de contas bancárias separadas.
