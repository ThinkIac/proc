# Contratos e migração

## Comportamento preservado

`provideProc(host)` cria o provedor `proc`, na fase `wire`. Ao receber `package:module`, ignora runtimes Node e inicia um ProcessBridge para os demais. A API mantém `start(pkg)` e `stop(folder)`. A entrada legada `compat/proc.cjs` também foi preservada.

Usa o pacote process-bridge para Python, Node, Deno, Ruby, Bun ou executáveis Rust. O provedor ignora Node no caminho automático. O runtime deve estar instalado no host. Registros recebidos no transporte adicionam assinaturas ao barramento. Saídas geram proc:crashed e consultam o Supervisor; sem Supervisor, o transporte conserva seu reinício com backoff. Stop cancela supervisão, remove assinaturas e encerra o processo e o escopo. Não oferece sandbox para o executável.

## Fronteira da plataforma

A migração mantém APIs Node onde a implementação original as utiliza. O formato .type não elimina dependências de processos, threads, sistema de arquivos ou IPC. Uma implementação embarcada exigirá outro adaptador com os mesmos contratos e uma validação específica.

## Distribuição

src contém a implementação editável. scripts/build.cjs compila recursivamente para dist; arquivos na raiz e em compat são fachadas CommonJS. O bootstrap child.js ou cpu-worker.js, quando presente, continua no pacote. Não editar dist diretamente.

## Validação

Testes em test/*.test.cjs exercitam a implementação original congelada em test/reference e a implementação .type com os mesmos cenários. Não representam prova de equivalência para toda entrada possível. Testes de integração no Lógos verificam autoridade, isolamento, reload e distribuição independente com a composição real.

## Integração

A base usa @thinkiac/module-proc fixado por commit. As entradas antigas podem encaminhar a esse pacote. createRuntimeModule permanece apenas como alias de compatibilidade; os comentários @register do provedor continuam sendo descobertos no código compilado.
