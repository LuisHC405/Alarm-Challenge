# Alarm Challenge

Alarm Challenge e uma API com frontend para criar alarmes que so param quando o usuario resolve um desafio corretamente.

O usuario pode cadastrar varios alarmes em horarios diferentes. Quando chega o horario de um alarme ativo, o navegador toca o som do alarme em loop e mostra um desafio de matematica ou programacao. Se a resposta estiver errada, o alarme continua tocando e o volume aumenta. Se a resposta estiver correta, o alarme para.

## Tecnologias

- Node.js
- Express
- TypeScript
- HTML, CSS e TypeScript no frontend
- Banco JSON local
- Node Test Runner para testes

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Abra no navegador:

```bash
http://localhost:3001
```

O projeto usa o arquivo `.env` para definir a porta:

```bash
PORT=3001
```

Se o `.env` nao existir, o servidor usa a porta padrao `3000`.

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

## Como Funciona

1. O usuario cria um alarme pelo frontend.
2. A API salva o alarme no banco JSON local.
3. O frontend verifica os alarmes cadastrados.
4. Quando o horario chega, o frontend inicia o alarme pela API.
5. A API gera um desafio de matematica ou programacao.
6. O som do alarme toca em loop no navegador.
7. O usuario envia a resposta.
8. Se acertar, o alarme para.
9. Se errar, o alarme continua tocando e o volume aumenta.

O banco local fica em:

```text
data/alarms.json
```

Esse arquivo e criado automaticamente quando necessario.

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

## Tipos de Desafio

- `math`: contas de matematica.
- `programming`: exercicios curtos de TypeScript.

## Dificuldades

- `easy`: desafios simples.
- `medium`: desafios intermediarios.
- `hard`: desafios mais complexos.

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
|   |-- database/
|   |-- models/
|   |-- repositories/
|   |-- routes/
|   `-- utils/
|-- server.ts
|-- server.test.ts
|-- tsconfig.json
|-- tsconfig.client.json
|-- tsconfig.server.json
|-- package.json
`-- README.md
```

## Observacoes

- O codigo fonte esta em TypeScript.
- O build gera a pasta `dist/`.
- O frontend compilado e copiado para `public/client/`.
- Os alarmes salvos localmente ficam em `data/alarms.json`.
- `dist/`, `public/client/` e `data/` nao precisam ser enviados para o GitHub.
