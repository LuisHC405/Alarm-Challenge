# Alarm Challenge

API com frontend para um alarme agendado que so desliga quando o usuario resolve um desafio corretamente.

O usuario escolhe um horario no frontend e seleciona o tipo de desafio: matematica ou programacao. Quando o horario chega, o frontend chama a API, o backend gera o desafio e o som do alarme toca no navegador ate a resposta estar correta.

## Como Rodar

No terminal Bash, instale as dependencias:

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

Para rodar em modo desenvolvimento:

```bash
npm run dev
```

Para executar os testes:

```bash
npm test
```

## Configuracao

O projeto usa um arquivo `.env` para configurar a porta:

```bash
PORT=3001
```

## Como a API Funciona

1. O usuario escolhe um horario no frontend.
2. Quando o horario chega, o frontend inicia o alarme pela API.
3. A API gera um desafio de matematica ou programacao.
4. O frontend toca o som do alarme.
5. O usuario envia uma resposta.
6. Se a resposta estiver correta, o alarme desliga.
7. Se a resposta estiver errada, o alarme continua tocando e aumenta o volume.
8. Se as tentativas acabarem, a API gera uma nova conta e o alarme continua ativo.

## Endpoints Principais

### Ver informacoes da API

```bash
curl http://localhost:3001/api
```

### Iniciar o alarme pela API com matematica

```bash
curl -X POST http://localhost:3001/alarm/start \
  -H "Content-Type: application/json" \
  -d '{"challengeType":"math","difficulty":"medium","maxAttempts":5}'
```

### Iniciar o alarme pela API com programacao

```bash
curl -X POST http://localhost:3001/alarm/start \
  -H "Content-Type: application/json" \
  -d '{"challengeType":"programming","difficulty":"easy","maxAttempts":5}'
```

### Ver status do alarme

```bash
curl http://localhost:3001/alarm/status
```

### Ver o desafio atual

```bash
curl http://localhost:3001/alarm/question
```

### Enviar resposta

```bash
curl -X POST http://localhost:3001/alarm/answer \
  -H "Content-Type: application/json" \
  -d '{"answer":56}'
```

Para desafio de programacao, envie o codigo como texto:

```bash
curl -X POST http://localhost:3001/alarm/answer \
  -H "Content-Type: application/json" \
  -d '{"answer":"console.log(\"Hello World\");"}'
```

## Tipos de Desafio

- `math`: contas de matematica.
- `programming`: exercicios curtos de TypeScript.

## Dificuldades de Matematica

- `easy`: soma e subtracao com numeros menores.
- `medium`: mistura soma, subtracao, multiplicacao e divisao.
- `hard`: usa numeros maiores e operacoes mais dificeis.

## Dificuldades de Programacao

- `easy`: comandos basicos, como imprimir `Hello World`.
- `medium`: funcoes simples com parametros e retorno.
- `hard`: metodos funcionais usando ideias como `filter` e `map`.

## Estrutura

```text
Alarm Challenge/
|-- public/
|   `-- assets/
|       `-- alarm.mp3
|-- src/
|   |-- alarmService.js
|   |-- serverApp.js
|   |-- challenges/
|   |   |-- index.js
|   |   |-- math.js
|   |   `-- programming.js
|   |-- client/
|   |   |-- alarm-api.js
|   |   |-- alarm-audio.js
|   |   |-- alarm-scheduler.js
|   |   |-- alarm-view.js
|   |   |-- app.js
|   |   |-- challenge-details.js
|   |   |-- challenge-selector.js
|   |   |-- index.html
|   |   `-- styles.css
|   |-- routes/
|   |   |-- alarmRoutes.js
|   |   `-- apiRoutes.js
|   `-- utils/
|       `-- random.js
|-- server.js
|-- server.test.js
|-- package.json
`-- README.md
```

## Observacao

O estado do alarme fica salvo em memoria. Isso e suficiente para estudo e demonstracao, mas em uma versao de producao o ideal seria usar banco de dados e separar alarmes por usuario.
