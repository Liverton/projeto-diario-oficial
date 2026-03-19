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
```bash
curl -sSL [https://install.python-poetry.org](https://install.python-poetry.org) | python3 -
```

# Adiciona o Poetry ao seu PATH (caso acabe de instalar)
```bash
export PATH="$HOME/.local/bin:$PATH"
```

# Entra no backend e instala as dependências
```bash
cd backend
poetry install
```

4. Configurando o Node.js & Frontend (NVM)
Usamos o NVM para gerenciar a versão exata do Node (v22) exigida pelo Vite.

# Instala o NVM
```bash
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh]
source ~/.bashrc # Recarrega o terminal
```

# Instala e usa o Node 22
```bash
nvm install 22
nvm use 22
```

# Instala dependências do React
```bash
cd ../frontend
npm install
```

5. Configuração de Ambiente (.env)
O arquivo de segredos não é versionado. Crie um novo na pasta backend/:

```bash
cd ../backend
touch .env
```

# Conteúdo sugerido para o .env:

```bash
DEBUG=True
SECRET_KEY=chave-secreta-dpes-123
DATABASE_URL=postgres://dpes_user:dpes_pass@localhost:5432/diario_db
ALLOWED_HOSTS=*
```

6. Subindo os Contêineres
Na raiz do projeto, suba o Banco de Dados e o container do Django:

```bash
cd ..
docker compose up -d --build
```

7. Migrações e Admin
Após subir os containers, rode as migrações iniciais e crie o superusuário:

# Cria as tabelas do Diário Oficial

```bash
docker compose exec backend python manage.py migrate
```

# Cria seu usuário de acesso ao Painel

```bash
docker compose exec backend python manage.py createsuperuser
```

8. Acessando o Sistema
Backend (Django Admin): http://localhost:8000/admin/
Frontend (React): http://localhost:5173/

🛠️ Comandos do Dia a Dia

Iniciar Projeto         docker compose up -d e cd frontend && npm run dev
Parar Projeto           docker compose down
Nova Migração           docker compose exec backend python manage.py makemigrations
Ver Logs                docker compose logs -f backend
Atualizar Código        git pull origin main

### Rotina GIT

# 1. Veja o que você alterou
```bash
git status
```

# 2. Adicione as mudanças
```bash
git add .
```

# 3. Salve com uma mensagem clara
```bash
git commit -m "feat: implementa listagem de edições no frontend"
```

# 4. Envie para o GitHub
```bash
git push origin main
```

Se você já clonou o projeto em casa anteriormente, você não clona de novo, você apenas atualiza.

# 1. Garanta que está na pasta do projeto
```bash
cd ~/projeto-diario-oficial
```

# 2. Puxe as novidades do servidor
```bash
git pull origin main
```

# 3. Se houve mudanças no banco, atualize o Docker
```bash
docker compose up -d --build
docker compose exec backend python manage.py migrate
```

-----

### Rotina Diária de Organização
Para evitar conflitos de código (os temidos merge conflicts) e manter o histórico limpo, siga este fluxo:

☕ Manhã: O Ritual de Início
Nunca comece a digitar código sem antes garantir que sua máquina local está igual ao GitHub.

git pull origin main: Baixa o que você (ou outro colega) fez por último.

docker compose up -d: Sobe o banco e o back.

🛠️ Durante o dia: Commits Atômicos
Não espere o dia acabar para fazer um commit gigante com 20 arquivos alterados.

Boa Prática: Terminou uma portaria? git commit. Ajustou um botão no React? git commit.

Exemplo de Alternativa: Se estiver testando algo arriscado, crie uma branch: git checkout -b teste-novo-layout. Se não prestar, você volta para a main e apaga a branch sem medo.

🏁 Fim do Expediente: O "Check-out"
git status: Verifique se esqueceu algum arquivo novo sem adicionar.

git push origin main: Envia seu progresso.

docker compose down: Libera a memória RAM do seu Zorin fechando os containers.