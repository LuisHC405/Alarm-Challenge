# Alarm Challenge

API com frontend para criar varios alarmes em horarios diferentes. Cada alarme toca no navegador e so para quando o usuario resolve corretamente um desafio de matematica ou programacao.

## Como Funciona

1. O usuario cria um alarme pelo frontend informando nome, horario, dificuldade e tipo de desafio.
2. A API salva esse alarme em um banco JSON local.
3. Quando o horario chega, o frontend inicia o alarme pela API.
4. O backend gera o desafio escolhido.
5. O som do alarme fica tocando em loop.
6. Se o usuario errar, o volume aumenta para forcar a atencao.
7. Se o usuario acertar, a API desativa o alarme atual e o som para.

O banco fica em `data/alarms.json` e e criado automaticamente quando necessario.

## Comandos

Instale as dependencias:

```bash
npm install
```

Rode o projeto:

```bash
npm start
```

Abra no navegador:

```bash
http://localhost:3001
```

Modo desenvolvimento:

```bash
npm run dev
```

Rodar testes:

```bash
npm test
```

Gerar os arquivos compilados sem iniciar o servidor:

```bash
npm run build
```

## Configuracao

Crie um arquivo `.env` se quiser mudar a porta:

```bash
PORT=3001
```

## CRUD de Alarmes

Listar alarmes:

```bash
curl http://localhost:3001/alarms
```

Criar um alarme:

```bash
curl -X POST http://localhost:3001/alarms \
  -H "Content-Type: application/json" \
  -d '{"name":"Estudar TypeScript","time":"07:30","challengeType":"programming","difficulty":"easy","enabled":true}'
```

Buscar um alarme:

```bash
curl http://localhost:3001/alarms/ID_DO_ALARME
```

Atualizar um alarme:

```bash
curl -X PUT http://localhost:3001/alarms/ID_DO_ALARME \
  -H "Content-Type: application/json" \
  -d '{"time":"08:00","difficulty":"medium"}'
```

Remover um alarme:

```bash
curl -X DELETE http://localhost:3001/alarms/ID_DO_ALARME
```

## Endpoints do Alarme Ativo

Iniciar um desafio manualmente:

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

## Tipos de Desafio

- `math`: contas de matematica.
- `programming`: exercicios curtos de TypeScript.

## Estrutura

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
|   |-- database/
|   |-- models/
|   |-- repositories/
|   |-- routes/
|   `-- utils/
|-- server.ts
|-- server.test.ts
|-- tsconfig.client.json
|-- tsconfig.server.json
|-- package.json
`-- README.md
```

O codigo fonte fica em `src/`. A pasta `dist/` e a pasta `public/client/` sao geradas pelo build.
