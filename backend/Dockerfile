FROM python:3.12-slim

# Impede que o Python gere arquivos .pyc e permite logs em tempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instala o Poetry no container
RUN pip install poetry

# Copia apenas os arquivos de dependência primeiro (otimiza o cache do Docker)
COPY pyproject.toml poetry.lock /app/

# Configura o poetry para não criar venv dentro do container (o container já é isolado)
RUN poetry config virtualenvs.create false && poetry install --no-root

COPY . /app/