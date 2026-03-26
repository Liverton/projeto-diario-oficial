# 🏛️ Diário Oficial - Defensoria Pública (DPES)

Sistema moderno para gerenciamento, composição e publicação de atos oficiais da Defensoria Pública do Estado do Espírito Santo.

---

## 🛠️ Tecnologias e Ferramentas

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Backend** | Django 4.2 | Python, Poetry, DRF |
| **Frontend** | React 18 | Vite, TypeScript, Tailwind |
| **Banco** | PostgreSQL 15 | Gerenciado via Docker |
| **Infra** | Docker | Docker Compose para orquestração |

---

## 🚀 Guia Quick Start

### 1. Requisitos do Sistema
Garanta que possui o básico instalado (Linux):
```bash
sudo apt update && sudo apt install -y git curl build-essential libpq-dev
```

### 2. Clonagem e Configuração
```bash
git clone https://github.com/seu-usuario/projeto-diario-oficial.git
cd projeto-diario-oficial
```

### 3. Backend (Poetry)
```bash
cd backend
poetry install
cp .env.example .env  # Ou crie um manualmente
```

### 4. Frontend (Node 22)
```bash
cd ../frontend
npm install
```

### 5. Subindo o Ambiente
Na raiz do projeto:
```bash
docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

---

## 💻 Links de Acesso Local
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend Admin:** [http://localhost:8000/admin](http://localhost:8000/admin)
- **Documentação da API:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs) (se disponível)

---

## 📘 Guia de Desenvolvimento
Para informações detalhadas sobre:
- 🌿 Padrão de Branches
- 💬 Conventional Commits
- 💎 Qualidade de Código (Linting/Formatting)
- 🚀 Fluxo de CI/CD

Consulte o nosso [**Guia de Desenvolvimento (DEVELOPMENT_GUIDE.md)**](file:///home/livertonabreu/projeto-diario-oficial/DEVELOPMENT_GUIDE.md).

---

## 🛡️ Qualidade de Código
Temos verificações automáticas em cada Pull Request:
- **Python:** `black` + `flake8`
- **TypeScript/React:** `ESLint`

Execute localmente antes de enviar:
```bash
# Backend
cd backend && poetry run black . && poetry run flake8 .

# Frontend
cd frontend && npm run lint
```