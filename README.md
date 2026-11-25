# @thinkiac/module-proc

Conecta processos externos ao barramento do Lógos.

Fontes em LógosType (`src/*.type`); JavaScript gerado em `dist/`. Entradas CommonJS preservam imports e descoberta declarativa. Migração de linguagem e distribuição, sem novos recursos.

## Instalação

```sh
npm install ThinkIac/proc#main
```

Para reproduzir uma instalação, substitua main pelo hash do commit. Requer Node 22 ou superior. Não foi validado em QuickJS ou ESP32.

## API e funcionamento

`provideProc(host)` cria o provedor `proc`, na fase `wire`. Ao receber `package:module`, ignora runtimes Node e inicia um ProcessBridge para os demais. A API mantém `start(pkg)` e `stop(folder)`. A entrada legada `compat/proc.cjs` também foi preservada.

```text
Pacote → package:module → ProcessBridge → subprocesso JSONL → resposta ao barramento.
```

Usa o pacote process-bridge para Python, Node, Deno, Ruby, Bun ou executáveis Rust. O provedor ignora Node no caminho automático. O runtime deve estar instalado no host. Registros recebidos no transporte adicionam assinaturas ao barramento. Saídas geram proc:crashed e consultam o Supervisor; sem Supervisor, o transporte conserva seu reinício com backoff. Stop cancela supervisão, remove assinaturas e encerra o processo e o escopo. Não oferece sandbox para o executável.

## Exemplo

```js
const { provideProc } = require('@thinkiac/module-proc');
// host é fornecido pelo adaptador de capacidades do Lógos.
const capability = provideProc(host);
const bridge = capability.api.start({
  folder: 'analytics', dir: '/app/packages/analytics',
  runtime: { runtime: 'python', main: 'main.py', events: ['analytics:*'] }
});
await capability.api.stop('analytics');
```

## Desenvolvimento

```sh
npm ci
npm test
npm run build
```

O build usa [LogosType](https://github.com/ThinkIac/LogosType) fixado por commit. A distribuição inclui JS compilado para uso sem compilador em produção. prepare recompila ao instalar pelo Git. Dependências entre módulos usam repositórios fixados, sem caminhos vizinhos.

[Contratos e migração](docs/contracts.md). MIT.
