# node-pagseguro

Integração ao Pagseguro para sistemas usando o Node.js

## Instalação

`npm install JasminDreasond/node-pagseguro`

## Como usar

Veja um exemplo de projeto utilizando o pacote `pagseguro` acessando este
repositório: https://github.com/emersonjsouza/node-pagseguro-sample.git

### Montando seu inicializador do Constructor

Use este modelo para construir seu código inicial para dar start a API

```json
{
    "credentials": {
        "email" : "suporte@lojamodelo.com.br",
        "production": {
            "token": "95112EE828D94278BD394E91C4388F20",
            "appID": "testezinho",
            "appKey": "APP_KEY"
        },
        "sandbox": {
            "token": "95112EE828D94278BD394E91C4388F20",
            "appID": "testezinho",
            "appKey": "APP_KEY"
        }
    }
}
```

### Trocar Modo

Para trocar o modo da sua operação de maneira rápida

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    pag.changeMode('payment');
```

### Trocar Credências

Troque as credências de API no seu script

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    pag.changeCredentials(JSONPagSeguro);
```

### Mudar de Sandbox para Produção ou vice versa

Gostaria de trocar o modo de operação? Aqui está

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    pag.isSandbox(true);
```

### Para pagamentos únicos

```javascript
    //Inicializar a função com o e-mail e token
    var pag, pagseguro;
    pagseguro = require('pagseguro');
    pag = new pagseguro(JSONPagSeguro);

    //Configurando a moeda e a referência do pedido
    pag.setCurrency('BRL');
    pag.setReference('12345');

    //Adicionando itens
    pag.addItem({
        id: 1,
        description: 'Descrição do primeiro produto',
        amount: "4230.00",
        quantity: 3,
        weight: 2342
    });

    pag.addItem({
        id: 2,
        description: 'Esta é uma descrição',
        amount: "5230.00",
        quantity: 3,
        weight: 2342
    });

    pag.addItem({
        id: 3,
        description: 'Descrição do último produto',
        amount: "8230.00",
        quantity: 3,
        weight: 2342
    });

    //Configurando as informações do comprador
    pag.setBuyer({
        name: 'José Comprador',
        email: 'comprador@uol.com.br',
        phoneAreaCode: '51',
        phoneNumber: '12345678'
    });

    //Configurando a entrega do pedido

    pag.setShipping({
        type: 1,
        street: 'Rua Alameda dos Anjos',
        number: '367',
        complement: 'Apto 307',
        district: 'Parque da Lagoa',
        postalCode: '01452002',
        city: 'São Paulo',
        state: 'RS',
        country: 'BRA'
    });

    //Configuranto URLs de retorno e de notificação (Opcional)
    //ver https://pagseguro.uol.com.br/v2/guia-de-integracao/finalizacao-do-pagamento.html#v2-item-redirecionando-o-comprador-para-uma-url-dinamica
    pag.setRedirectURL("http://www.lojamodelo.com.br/retorno");
    pag.setNotificationURL("http://www.lojamodelo.com.br/notificacao");

    //Enviando o xml ao pagseguro
    pag.send().then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Assinaturas (Pagamentos Recorrentes)

```javascript
    // Inicializa o objeto PagSeguro em modo assinatura
    JSONPagSeguro.mode = "subscription";
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    //Configurando a moeda e a referência do pedido
    pag
        .setCurrency('BRL')
        .setReference('12345');

    /***********************************
    *     Configura a assinatura       *
    ************************************/

    //Configurando as informações do comprador
    pag.setBuyer({
        name: 'José Comprador',
        email: 'comprador@uol.com.br',
        phoneAreaCode: '51',
        phoneNumber: '12345678',
        street: 'Rua Alameda dos Anjos',
        number: '367',
        complement: 'Apto 307',
        district: 'Parque da Lagoa',
        postalCode: '01452002',
        city: 'São Paulo',
        state: 'RS',
        country: 'BRA'
    });

    // Configurando os detalhes da assinatura (ver documentação do PagSeguro para mais parâmetros)
    pag.setPreApproval({
        // charge: 'auto' para cobranças automáticas ou 'manual' para cobranças
        // disparadas pelo seu back-end
        // Ver documentação do PagSeguro sobre os tipos de cobrança
        charge: 'auto',
        // Título da assinatura (até 100 caracteres)
        name: 'Assinatura de serviços',
        // Descrição da assinatura (até 255 caracteres)
        details: 'Assinatura mensal para prestação de serviço da loja modelo',
        // Valor de cada pagamento
        amountPerPayment: '50.00',
        // Peridiocidade dos pagamentos: Valores: 'weekly','monthly','bimonthly',
        // 'trimonthly','semiannually','yearly'
        period: 'monthly',
        // Data de expiração da assinatura (máximo 2 anos após a data inicial)
        finalDate: '2016-10-09T00:00:00.000-03:00'
    });



    //Configurando URLs de retorno e de notificação (Opcional)
    //ver https://pagseguro.uol.com.br/v2/guia-de-integracao/finalizacao-do-pagamento.html#v2-item-redirecionando-o-comprador-para-uma-url-dinamica
    pag
        .setRedirectURL("http://www.lojamodelo.com.br/retorno")
        .setNotificationURL("http://www.lojamodelo.com.br/notificacao");

    // Configurando URL de revisão dos termos de assinatura (Opcional)
    pag.setReviewURL("http://www.lojamodelo.com.br/revisao");

    //Enviando o xml ao pagseguro
    pag.send().then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Criar um Plano

Crie adesão ao seu plano

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    // https://dev.pagseguro.uol.com.br/reference#adesão-ao-plano
    pag.createPlan({}).then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Obter Link de Checkout para Assinaturas

Coloque seu código para ser convertido em um link para direcionar o cliente para a página de pagamento

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.getCheckoutPlan("pre_Approval_Request_Code").then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Editar Assinaturas

Editar uma assinatura criada por você. O primeiro valor é o código do preApproval, depois vem o preço, e no final você escolhe se você quer forçar o novo valor a todos os usuários subscritos.

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.editPreApproval("pre_Approval_Request_Code", "NOVO_PREÇO", false).then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Suspender ou reativar assinatura de usuário

Modifique o status de uma adesão de plano

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.setStatusPlan("pre-approval-code", false).then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Gerenciar quem vai receber o dinheiro

Aqui você pode usar o código de Public Key gerada pela sua aplicação para definir o vendedor primário.
String para configuração simples e Object para configuração avançada.

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Vendedor Primário
    pag.setPrimaryReceiver("PUBLIC_KEY");
```

Você também precisa adicionar os vendedores secundários caso queira compartilhar o valor do pagamento.
Amount é a quantidade a ser recebida pelo vendedor, ela pode ser uma String para configuração básica ou Object para configuração avançada.


```javascript
    // Vendedor Secundário
    pag.addreceiver("AMOUNT", "PUBLIC_KEY");
```

### Notificações

Checando transação através do código de notificação

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.getNotification("NOTIFICATION_CODE").then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Transações

Checando transação através do código

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.getTransaction("TRANSACTION_CODE").then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Saldo

Obter o saldo da sua conta do PagSeguro

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.getBalance().then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Solicitando Transferência

Criar código de transferência

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.createTransfer({
	    receiverEmail: '{email_destinatário}',
	    amount: '5.00',
	    description: 'Transferência Teste 123'
    }).then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Autorizar Transferência

Autorizar código de transferência

```javascript
    // Inicializa o objeto PagSeguro
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);

    // Obter Notificação
    pag.authorizeTransfer('{{authorization code do retorno da solicitação}}').then(function(result){
        console.log(result);
    }).catch(function(err){
        console.error(err);
    });
```

### Modo Sandbox

O modo Sandbox do PagSeguro (hoje, 09/10/2014, em beta) permite o desenvolvedor a testar seu código usando o serviço do PagSeguro sem disparar transações reais mas ainda recebendo notificações. Por enquanto ele só dá suporte a pagamentos padrão, logo para testar assinaturas ainda é necessário realizar uma transação real.

Para utilizar o modo Sandbox, basta inicializar a biblioteca com a opção `mode : 'sandbox'` como no exemplo abaixo e utilizá-la para gerar pagamentos avulsos.

```javascript
    // Inicializa o objeto PagSeguro em modo assinatura
    JSONPagSeguro.sandbox = true;
    var pagseguro = require('pagseguro'),
        pag = new pagseguro(JSONPagSeguro);
```

É preciso gerar um token específico para o modo Sandbox na [Página do Sandbox do PagSeguro](https://sandbox.pagseguro.uol.com.br)
