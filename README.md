# Alarm Challenge

Alarm Challenge e uma API com frontend para criar alarmes que so param quando o usuario resolve um desafio corretamente.

O usuario pode cadastrar varios alarmes em horarios diferentes. Quando chega o horario de um alarme ativo, o navegador toca o som do alarme em loop e mostra um desafio de matematica ou programacao. Se a resposta estiver errada, o alarme continua tocando e o volume aumenta. Se a resposta estiver correta, o alarme para.

O frontend possui tres telas principais: criacao/listagem de alarmes, desafio de matematica e desafio de programacao.

## Organizacao do Backend

O projeto usa uma organizacao por modulo, inspirada na referencia do EventFlow. Assim, tudo que pertence ao alarme fica junto e o codigo compartilhado nao se mistura com a regra de negocio:

```text
src/
  modules/
    alarms/
      domain/                 # Tipos do alarme
      services/               # Regras do CRUD
      infra/http/             # Controller e rotas
      infra/orm/              # Repositorio PostgreSQL
    challenges/               # Rotas do desafio que libera o alarme
  shared/infra/http/          # Rotas compartilhadas, como /api
  database/                   # Conexao com PostgreSQL
  client/                     # Frontend
```

O caminho de uma requisicao de alarme e: `rota -> controller -> service -> repository -> PostgreSQL`.

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Crie seu arquivo `.env` usando o exemplo:

```bash
cp .env.example .env
```

Suba o PostgreSQL com Docker, se tiver Docker instalado:

```bash
docker compose up -d
```

Se nao tiver Docker, instale o PostgreSQL localmente e crie um banco chamado `alarm_challenge` com usuario `luiszin` e senha `salve123`, ou ajuste a `DATABASE_URL` para os dados do seu PostgreSQL.

Inicie o servidor:

```bash
npm start
```

Abra no navegador:

```bash
http://localhost:3001
```

## Variaveis de Ambiente

Exemplo:

```bash
PORT=3001
MAX_ATTEMPTS=5
DATABASE_URL=postgresql://luiszin:salve123@localhost:5432/alarm_challenge
PGSSL=false
```


## Comandos Uteis

Rodar em modo desenvolvimento:

```bash
npm run dev
```

Compilar o projeto:

```bash
npm run build
```

Executar os testes:

```bash
npm test
```

Parar o PostgreSQL do Docker:

```bash
docker compose down
```

## Postman

O projeto possui uma collection pronta para testar a API:

```text
postman/Alarm Challenge.postman_collection.json
```

Como usar:

1. Abra o Postman.
2. Clique em `Import`.
3. Selecione o arquivo `postman/Alarm Challenge.postman_collection.json`.
4. Rode primeiro a requisicao `Criar alarme`.

A collection usa estas variaveis:

- `baseUrl`: endereco da API, por padrao `http://localhost:3001`.
- `alarmId`: preenchido automaticamente quando a requisicao `Criar alarme` retorna sucesso.

## Como Funciona

1. O usuario cria um alarme pelo frontend.
2. A API salva o alarme no PostgreSQL.
3. O frontend verifica os alarmes cadastrados.
4. Quando o horario chega, o frontend inicia o alarme pela API.
5. A API gera um desafio de matematica ou programacao.
6. O som do alarme toca em loop no navegador.
7. O usuario envia a resposta.
8. Se acertar, o alarme para.
9. Se errar, o alarme continua tocando e o volume aumenta.

A tabela `alarms` e criada automaticamente pela API quando necessario.

## Endpoints da API

### Informacoes da API

```bash
curl http://localhost:3001/api
```

### CRUD de Alarmes

Listar alarmes:

```bash
curl http://localhost:3001/alarms
```

Criar alarme:

```bash
curl -X POST http://localhost:3001/alarms \
  -H "Content-Type: application/json" \
  -d '{"name":"Estudar TypeScript","time":"07:30","challengeType":"programming","difficulty":"easy","enabled":true}'
```

Buscar alarme por id:

```bash
curl http://localhost:3001/alarms/ID_DO_ALARME
```

Atualizar alarme:

```bash
curl -X PUT http://localhost:3001/alarms/ID_DO_ALARME \
  -H "Content-Type: application/json" \
  -d '{"time":"08:00","difficulty":"medium","enabled":true}'
```

Remover alarme:

```bash
curl -X DELETE http://localhost:3001/alarms/ID_DO_ALARME
```

### Alarme Ativo

Iniciar alarme manualmente:

```bash
curl -X POST http://localhost:3001/alarm/start \
  -H "Content-Type: application/json" \
  -d '{"challengeType":"math","difficulty":"medium","maxAttempts":5}'
```

Ver status:

```bash
curl http://localhost:3001/alarm/status
```

Ver desafio atual:

```bash
curl http://localhost:3001/alarm/question
```

Enviar resposta:

```bash
curl -X POST http://localhost:3001/alarm/answer \
  -H "Content-Type: application/json" \
  -d '{"answer":56}'
```

Para desafio de programacao, envie a resposta como texto:

```bash
curl -X POST http://localhost:3001/alarm/answer \
  -H "Content-Type: application/json" \
  -d '{"answer":"console.log(\"Hello World\");"}'
```

## Estrutura do Projeto

```text
Alarm Challenge/
|-- public/
|   `-- assets/
|       `-- alarm.mp3
|-- src/
|   |-- alarmService.ts
|   |-- serverApp.ts
|   |-- challenges/
|   |-- client/
|   |-- controllers/
|   |-- database/
|   |-- models/
|   |-- repositories/
|   |-- routes/
|   `-- utils/
|-- docker-compose.yml
|-- server.ts
|-- server.test.ts
|-- tsconfig.json
|-- tsconfig.client.json
|-- tsconfig.server.json
|-- package.json
`-- README.md
```
