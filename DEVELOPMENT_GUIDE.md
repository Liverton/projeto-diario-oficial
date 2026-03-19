# 📘 Guia de Desenvolvimento e Fluxo de Trabalho (Diário Oficial - DPES)

Este guia documenta a infraestrutura técnica, as ferramentas de qualidade e o fluxo de trabalho (workflow) estabelecidos para o projeto do Diário Oficial da Defensoria Pública (DPES).

---

## 🏗️ 1. Infraestrutura e Dependências

### **Backend (Django + Poetry)**
O backend utiliza **Django 4.2** com foco em APIs robustas e seguras.
*   **Django REST Framework (DRF):** Biblioteca padrão para construção de APIs. Facilita a serialização de dados e a criação de endpoints padronizados.
*   **Django-CORS-Headers:** Essencial para permitir que o Frontend (React) se comunique com o Backend (Django), já que estão em origens/portas diferentes.
*   **Django-Environ:** Gerencia variáveis de ambiente (como `SECRET_KEY` e `DATABASE_URL`) através de um arquivo `.env`, mantendo segredos fora do histórico do Git.
*   **Poetry:** Gerenciador de dependências moderno que utiliza o `pyproject.toml`. Ele garante que todos os desenvolvedores usem exatamente as mesmas versões das bibliotecas.

### **Frontend (React + Vite + TypeScript)**
*   **Vite:** Ferramenta de build ultra-rápida.
*   **TypeScript:** Adiciona tipagem estática ao JavaScript, prevenindo erros comuns durante o desenvolvimento.

---

## 💎 2. Qualidade de Código (Linting e Formatação)

Para manter o código padronizado e livre de erros bobos, utilizamos três ferramentas principais:

1.  **Black (Personal Trainer do Código Python):**
    *   **O que faz:** Formata o código automaticamente. Ele decide onde quebrar linhas, como usar aspas e espaços.
    *   **Comando:** `cd backend && poetry run black .`
2.  **Flake8 (O Fiscal de Estilo):**
    *   **O que faz:** Verifica se você seguiu as boas práticas (PEP 8). Ele avisa sobre imports não utilizados, variáveis não declaradas ou complexidade excessiva.
    *   **Configuração:** Ajustamos o `.flake8` para ser compatível com o Black (máximo de 88 caracteres por linha).
    *   **Comando:** `cd backend && poetry run flake8 .`
3.  **ESLint (Qualidade no React):**
    *   **O que faz:** Faz o mesmo que o Flake8, mas para o Frontend. Verifica regras de hooks do React e boas práticas de TypeScript.
    *   **Comando:** `cd frontend && npm run lint`

---

## 🚀 3. DevOps e Automação (CI/CD)

### **GitHub Actions (Integração Contínua)**
Localizado em `.github/workflows/ci.yml`.
Toda vez que um código é enviado para o GitHub através de um **Pull Request**, um servidor automatizado:
1.  Sobe um ambiente Linux limpo.
2.  Instala todas as dependências do projeto.
3.  Roda o **Flake8** e o **ESLint**.
4.  **Resultado:** Se houver erros, o GitHub impede o "Merge" (união do código) até que o erro seja corrigido. Isso garante que a branch `main` esteja sempre estável.

### **Template de Pull Request**
Localizado em `.github/pull_request_template.md`.
Ao criar um pedido de integração de código, o sistema preenche um formulário automático. Isso força o desenvolvedor a refletir sobre:
*   O que foi feito?
*   Como isso impacta o sistema?
*   Como o revisor pode testar?

---

## 🔄 4. Fluxo de Trabalho Diário (Git Workflow)

Para trabalhar de forma profissional, siga estes passos:

### **Padrão de Branches**
Nunca trabalhe na branch `main`. Crie branches temporárias:
*   `feature/nome-da-func`: Para novas funcionalidades.
*   `fix/nome-do-bug`: Para correções de erros.
*   `docs/mudanca`: Para documentação.

### **Padrão de Commits (Conventional Commits)**
Use mensagens que descrevam a intenção da mudança:
*   `feat: adiciona filtro por data nas portarias`
*   `fix: corrige erro de autenticação na API`
*   `style: melhora design dos cards no frontend`

---

## 🌐 5. Desenvolvimento Local e Troubleshooting

### **Problema de Proxy (Importante!)**
Se você estiver em um ambiente com Proxy (como o da DPES), o navegador pode tentar buscar o `localhost` fora da rede, causando erros de conexão.
*   **Solução:** Sempre garanta que a variável `NO_PROXY` inclua o local:
    ```bash
    export NO_PROXY="localhost,127.0.0.1"
    ```
*   **No Navegador:** Adicione `localhost` às exceções de proxy nas configurações do sistema.

### **Comandos do Dia a Dia**
*   **Subir tudo:** `docker compose up -d`
*   **Entrar no Backend:** `cd backend && poetry shell`
*   **Rodar Migrations:** `docker compose exec backend python manage.py migrate`
*   **Rodar Frontend:** `cd frontend && npm run dev`

---

## ✅ Resumo do Checklist do Desenvolvedor
1.  [ ] Criou uma branch nova para a tarefa.
2.  [ ] Desenvolveu a funcionalidade.
3.  [ ] Rodou o `black` e `flake8` no backend.
4.  [ ] Rodou o `lint` no frontend.
5.  [ ] Fez o commit com mensagem clara (ex: `feat: ...`).
6.  [ ] Abriu o Pull Request e preencheu o template.
7.  [ ] Esperou o "check verde" do GitHub Actions.
