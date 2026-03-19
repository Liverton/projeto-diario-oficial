# 🏛️ Diário Oficial - Defensoria Pública (DPES)

Sistema de gerenciamento, composição e publicação de atos oficiais.

---

## Tecnologias Utilizadas
- [cite_start]**Backend:** Django 4.2.11 (Python + Poetry) [cite: 1, 2, 4]
- **Frontend:** React 18.3.1 (Vite + TypeScript)
- [cite_start]**Banco de Dados:** PostgreSQL 15 [cite: 5]
- [cite_start]**Infraestrutura:** Docker & Docker Compose [cite: 5]

## 🚀 Guia de Inicialização (Para novas máquinas)

Siga este passo a passo caso esteja baixando o projeto pela primeira vez em um novo computador com **Linux**.

1. Ferramentas Básicas do Sistema
Antes de tudo, garanta que o sistema possui o básico para comunicação e download:

```bash
sudo apt update
sudo apt install -y git curl build-essential libpq-dev
```

2. Clonando o repositório

```bash
git clone [https://github.com/seu-usuario/projeto-diario-oficial.git](https://github.com/seu-usuario/projeto-diario-oficial.git)
cd projeto-diario-oficial
```

3. Configurando o Python & Backend (Poetry)

# Instala o Poetry
curl -sSL [https://install.python-poetry.org](https://install.python-poetry.org) | python3 -

# Adiciona o Poetry ao seu PATH (caso acabe de instalar)
export PATH="$HOME/.local/bin:$PATH"

# Entra no backend e instala as dependências
cd backend
poetry install

4. Configurando o Node.js & Frontend (NVM)
Usamos o NVM para gerenciar a versão exata do Node (v22) exigida pelo Vite.

# Instala o NVM
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh) | bash
source ~/.bashrc # Recarrega o terminal

# Instala e usa o Node 22
nvm install 22
nvm use 22

# Instala dependências do React
cd ../frontend
npm install

5. Configuração de Ambiente (.env)
O arquivo de segredos não é versionado. Crie um novo na pasta backend/:

cd ../backend
touch .env

# Conteúdo sugerido para o .env:

DEBUG=True
SECRET_KEY=chave-secreta-dpes-123
DATABASE_URL=postgres://dpes_user:dpes_pass@localhost:5432/diario_db
ALLOWED_HOSTS=*

6. Subindo os Contêineres
Na raiz do projeto, suba o Banco de Dados e o container do Django:

cd ..
docker compose up -d --build

7. Migrações e Admin
Após subir os containers, rode as migrações iniciais e crie o superusuário:

# Cria as tabelas do Diário Oficial
docker compose exec backend python manage.py migrate

# Cria seu usuário de acesso ao Painel
docker compose exec backend python manage.py createsuperuser

8. Acessando o Sistema
Backend (Django Admin): http://localhost:8000/admin/
Frontend (React): http://localhost:5173/

🛠️ Comandos do Dia a Dia

Iniciar Projeto         docker compose up -d e cd frontend && npm run dev
Parar Projeto           docker compose down
Nova Migração           docker compose exec backend python manage.py makemigrations
Ver Logs                docker compose logs -f backend
Atualizar Código        git pull origin main