# 📘 Guia de Desenvolvimento (Diário Oficial - DPES)

Este guia documenta a infraestrutura técnica, as ferramentas de qualidade e o fluxo de trabalho (workflow) estabelecidos para o projeto do Diário Oficial da Defensoria Pública (DPES).

---

## 🏗️ 1. Arquitetura e Estrutura

### **Backend (Django + Poetry)**
- **Versão:** Django 4.2
- **Gerenciador:** Poetry (usa `pyproject.toml` para garantir versões exatas).
- **Módulos Principais:**
  - `authentication`: Gerenciamento de tokens JWT (SimpleJWT). Endpoints em `/api/auth/`.
  - `diario_oficial`: Lógica principal das portarias e edições.
  - `core`: Configurações globais do projeto.

### **Frontend (React + Vite + TypeScript)**
- **Vite:** Build ultra-rápido.
- **TypeScript:** Tipagem estática para segurança do código.
- **Tailwind CSS:** (Se configurado) Estilização via classes utilitárias.

---

## 💎 2. Qualidade de Código

Para manter o código padronizado:

1. **Black (Backend):** Formatação automática.
   - `cd backend && poetry run black .`
2. **Flake8 (Backend):** Linter de estilo (PEP 8).
   - `cd backend && poetry run flake8 .`
3. **ESLint (Frontend):** Qualidade React/TypeScript.
   - `cd frontend && npm run lint`

---

## 🚀 3. CI/CD e Automação

### **GitHub Actions**
Arquivo: `.github/workflows/ci.yml`.
Bloqueia Merges se o lint (Flake8/ESLint) falhar no Pull Request.

### **Template de PR**
Arquivo: `.github/pull_request_template.md`.
Deve ser preenchido detalhadamente para facilitar a revisão.

---

## 🔄 4. Fluxo Git (Branching & Commits)

### **Branches**
NUNCA use a `main` diretamente. Use prefixos:
- `feature/`: Novas funções.
- `fix/`: Correções.
- `docs/`: Documentação.

### **Commits (Conventional Commits)**
Use mensagens descritivas:
- `feat: ...`
- `fix: ...`
- `style: ...`
- `refactor: ...`

---

## 🌐 5. Troubleshooting e Proxy

### **Proxy DPES**
Se houver erro de conexão com o localhost, garanta:
```bash
export NO_PROXY="localhost,127.0.0.1"
```

---

## ✅ Checklist do Desenvolvedor
1. [ ] Criei branch com prefixo correto.
2. [ ] Formatei o backend com `black`.
3. [ ] Verifiquei lints (`flake8` e `npm lint`).
4. [ ] Fiz commit seguindo o padrão Conventional.
5. [ ] Abri o PR usando o template atualizado.
6. [ ] Garanti que o GitHub Actions passou (check verde).

