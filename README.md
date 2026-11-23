# AgentLab - Meu Negócio na Nuvem

O **AgentLab** é um site institucional fictício com a temática **"Crie seu próprio Agente de IA"**. O objetivo acadêmico não é executar um LLM real nesta versão, mas demonstrar uma publicação web completa com **Docker, Docker Compose, Nginx, proxy reverso, domínio simulado e CI/CD com Jenkins**.

## Requisitos obrigatórios atendidos

| Item obrigatório | Implementação no AgentLab | Evidência sugerida |
|---|---|---|
| Diagrama da Arquitetura | Fluxo Git -> Jenkins -> Docker -> Nginx Proxy -> site | Diagrama abaixo |
| Dockerfile | Imagem `nginx:alpine` contendo o conteúdo de `site/` | `Dockerfile` |
| docker-compose.yml | Orquestra os serviços `web` e `proxy` em rede bridge dedicada | `docker-compose.yml` |
| Nginx ou Apache configurado | Nginx serve o site e outro Nginx funciona como reverse proxy | `nginx/nginx.conf` |
| CI/CD simulado ou configurado | Jenkins executa checkout, versionamento, validação, build, deploy e health check | `Jenkinsfile` + tela do Jenkins |
| Simulação de domínio | `agentlab.local` resolvido pelo arquivo `hosts` para `127.0.0.1` | Print do hosts + navegador |
| Print do site no navegador | Site acessível por `http://agentlab.local` | Print da página funcionando |

## Arquitetura

```text
Desenvolvedor
     |
     | git push
     v
Repositório Git
     |
     | Poll SCM
     v
Jenkins :8080
     |
     +--> Checkout
     +--> Version
     +--> Validate
     +--> Docker Build
     +--> Deploy
     +--> Health Check
             |
             v
        Docker Engine
             |
       +-----+-----+
       |           |
  Nginx Proxy    Web
     :80       Nginx + site
       |           ^
       +-----------+
             |
     agentlab.local
```

## Decisões técnicas e justificativas

### Docker
O site é empacotado a partir de `nginx:alpine`. A imagem Alpine foi escolhida por ser adequada a uma aplicação estática simples e por evitar dependências de runtime desnecessárias.

### Docker Compose
O Compose separa a solução em dois serviços:
- `web`: contém os arquivos HTML, CSS e JavaScript;
- `proxy`: é o único serviço publicado na porta `80` do host.

Os serviços conversam pela rede privada `agent-network`. A aplicação `web` não expõe diretamente uma porta para o computador, reforçando o papel do proxy como ponto de entrada.

### Nginx e proxy reverso
O arquivo `nginx/nginx.conf` recebe requisições para `agentlab.local` e encaminha para `http://web:80`. O nome `web` é resolvido pelo DNS interno do Docker Compose.

### Domínio simulado
Em vez de comprar um domínio para a atividade, é utilizado:

```text
127.0.0.1 agentlab.local
```

Isso permite demonstrar resolução de nome e acesso por domínio mantendo todo o laboratório local.

### Jenkins para CI/CD
O Jenkins foi escolhido para que a automação seja visível e executável localmente. O `Jenkinsfile` mantém o pipeline versionado junto do código e implementa:

1. **Checkout**: obtém a revisão mais recente do Git.
2. **Version**: grava `BUILD_NUMBER` e commit em `site/version.json`.
3. **Validate**: executa `docker compose config` antes do deploy.
4. **Build**: gera `agentlab:<BUILD_NUMBER>` e `agentlab:latest`.
5. **Deploy**: recria os containers usando a imagem referente ao build.
6. **Health Check**: usa `curl` para confirmar que o proxy responde via HTTP.

Para a apresentação, o Jenkins pode acompanhar o repositório usando **Poll SCM**. Uma expressão como `H/2 * * * *` verifica alterações em intervalo aproximado de dois minutos, evitando a necessidade de expor o Jenkins local à internet para receber um webhook.

## Estrutura do repositório

```text
.
├── jenkins/
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── site/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── version.json
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.jenkins.yml
├── Jenkinsfile
└── README.md
```

## Como executar

### Pré-requisitos
- Git
- Docker Engine ou Docker Desktop
- Docker Compose v2

### 1. Subir o Jenkins

```bash
docker compose -f docker-compose.jenkins.yml up -d --build
```

Abra `http://localhost:8080`.

Obtenha a senha inicial:

```bash
docker exec agentlab-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

No primeiro acesso, instale os plugins sugeridos. Os plugins **Pipeline** e **Git** são necessários para o fluxo deste projeto.

### 2. Criar o pipeline Jenkins

1. Clique em **New Item**.
2. Informe `agentlab`.
3. Selecione **Pipeline**.
4. Em **Definition**, selecione **Pipeline script from SCM**.
5. Selecione **Git**.
6. Informe a URL do repositório.
7. Para repositório privado, associe uma credencial.
8. Defina **Script Path** como `Jenkinsfile`.
9. Em **Build Triggers**, habilite **Poll SCM**.
10. Para a demonstração, use `H/2 * * * *`.

### 3. Configurar `agentlab.local`

Linux/macOS, arquivo `/etc/hosts`:

```text
127.0.0.1 agentlab.local
```

Windows, editar como administrador:

```text
C:\Windows\System32\drivers\etc\hosts
```

e adicionar a mesma entrada.

### 4. Fazer o primeiro deploy

Faça um commit e push para o repositório. Quando o Jenkins detectar a revisão, ele executará o pipeline. Também é possível usar **Build Now** para a primeira demonstração.

Após sucesso:

```text
http://agentlab.local
```

## Como acompanhar o CI/CD

No Jenkins, abra:

```text
agentlab -> Build History -> Console Output
```

No host, confira os containers:

```bash
docker compose ps
```

E as imagens versionadas:

```bash
docker images agentlab
```

Uma demonstração recomendada é alterar o HTML, fazer `git push`, acompanhar um novo `BUILD_NUMBER` no Jenkins e atualizar `agentlab.local` após o health check ficar verde.

## Evidências para a entrega

Sugestão de prints:

1. **Arquitetura**: diagrama desta documentação ou versão redesenhada no Draw.io.
2. **Docker**: `docker compose ps` com `agentlab-web` e `agentlab-proxy` ativos.
3. **Nginx/domínio**: navegador carregando `http://agentlab.local`.
4. **CI/CD**: pipeline Jenkins com todos os estágios verdes.
5. **Deploy**: console do Jenkins mostrando Build -> Deploy -> Health Check.

## Relação com os critérios de avaliação

- **Clareza e funcionalidade**: arquitetura documentada, separação entre CI/CD, proxy e aplicação e fluxo reproduzível.
- **Uso correto do Docker**: Dockerfile, Compose, imagens versionadas e rede dedicada.
- **Configuração do servidor**: Nginx personalizado como reverse proxy, encaminhando para outro serviço na rede Docker.
- **CI/CD**: Pipeline as Code real com Jenkins, validação, build, deploy automático e teste pós-deploy.
- **Apresentação e justificativas**: decisões técnicas registradas neste README e evidências sugeridas para demonstração.

## Observação de segurança

Para simplificar o laboratório, o container Jenkins recebe `/var/run/docker.sock`. Isso permite que o Jenkins controle o Docker do host e, portanto, envolve privilégios elevados. É uma escolha deliberada **apenas para esta simulação local**. Em produção, a abordagem recomendada seria separar agentes Jenkins e restringir permissões sobre a infraestrutura de execução.
