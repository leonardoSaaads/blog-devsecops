/** Hierarquia de diretórios do Linux (FHS 3.0 + convenções do systemd/usr-merge). */

export interface FsNode {
  name: string;
  summary: string;
  detail?: string;
  /** Sistema de arquivos virtual (conteúdo gerado pelo kernel, não está em disco). */
  virtual?: boolean;
  /** Link simbólico (usr-merge). */
  link?: string;
  security?: string;
  command?: string;
  children?: FsNode[];
}

export const FS_ROOT: FsNode = {
  name: "/",
  summary:
    "Raiz única da árvore: discos, partições e até sistemas virtuais são montados abaixo dela.",
  command: "findmnt --real",
  children: [
    {
      name: "bin",
      link: "usr/bin",
      summary:
        "Executáveis essenciais. Nas distribuições atuais é um link para /usr/bin (usr-merge).",
    },
    {
      name: "boot",
      summary: "Kernel (vmlinuz), initramfs e configuração do carregador de inicialização.",
      security:
        "Em sistemas com Secure Boot, o kernel e o initramfs são verificados por assinatura.",
      command: "ls -lh /boot",
    },
    {
      name: "dev",
      virtual: true,
      summary: "Dispositivos como arquivos (devtmpfs, gerenciado pelo udev).",
      command: "ls -l /dev/sd* /dev/nvme*",
      children: [
        {
          name: "null",
          summary: "Descarta tudo o que é escrito; leitura retorna EOF.",
          command: "comando 2>/dev/null",
        },
        {
          name: "urandom",
          summary:
            "Gerador criptográfico de números aleatórios do kernel (não bloqueia após a inicialização).",
          command: "head -c 32 /dev/urandom | base64",
        },
        {
          name: "sda",
          summary: "Primeiro disco SATA/SCSI; partições são sda1, sda2…",
          security: "Escrever diretamente aqui (dd) destrói o sistema de arquivos.",
        },
      ],
    },
    {
      name: "etc",
      summary: "Configuração do sistema em texto puro — versionável e auditável.",
      command: "sudo git -C /etc log --oneline  # com etckeeper",
      children: [
        {
          name: "passwd",
          summary:
            "Contas de usuário (nome, UID, GID, shell). Legível por todos; não contém senhas.",
          command: "getent passwd $(whoami)",
        },
        {
          name: "shadow",
          summary: "Hashes de senha (yescrypt/SHA-512).",
          security: "Permissão 640 root:shadow. Se estiver legível por outros, é incidente.",
          command: "sudo ls -l /etc/shadow",
        },
        {
          name: "ssh",
          summary: "Configuração do cliente e do servidor OpenSSH.",
          children: [
            {
              name: "sshd_config",
              summary: "Servidor SSH.",
              security:
                "Desative login de root e por senha: PermitRootLogin no, PasswordAuthentication no.",
              command: "sudo sshd -T | grep -Ei 'permitroot|passwordauth'",
            },
          ],
        },
        {
          name: "systemd",
          summary: "Units locais e overrides; os padrões do pacote ficam em /usr/lib/systemd.",
          command: "systemctl cat nginx.service",
        },
      ],
    },
    {
      name: "home",
      summary: "Diretórios pessoais dos usuários (/home/ana, /home/bruno).",
      security: "Use 700 ou 750: por padrão algumas distros criam com 755 (legível por todos).",
    },
    {
      name: "lib",
      link: "usr/lib",
      summary: "Bibliotecas compartilhadas e módulos do kernel (link para /usr/lib).",
    },
    { name: "mnt", summary: "Ponto de montagem temporário, manual (o administrador monta aqui)." },
    { name: "opt", summary: "Software de terceiros autocontido (/opt/fornecedor/app)." },
    {
      name: "proc",
      virtual: true,
      summary: "Janela para o kernel (procfs): processos e parâmetros em tempo de execução.",
      command: "cat /proc/loadavg",
      children: [
        {
          name: "cpuinfo",
          summary: "Modelo, núcleos e flags da CPU.",
          command: "grep -c processor /proc/cpuinfo",
        },
        {
          name: "meminfo",
          summary: "Memória total, livre, cache e swap — fonte do free e do Node Exporter.",
          command: "head -5 /proc/meminfo",
        },
        {
          name: "self",
          summary: "Link para o diretório do próprio processo que lê (/proc/<pid>).",
          command: "ls -l /proc/self/fd",
        },
        {
          name: "sys",
          summary: "Parâmetros ajustáveis do kernel (sysctl).",
          command: "sysctl net.ipv4.ip_forward",
        },
      ],
    },
    {
      name: "root",
      summary: "Diretório pessoal do superusuário (fora de /home de propósito).",
      security: "Permissão 700; não deve ser legível por outros usuários.",
    },
    {
      name: "run",
      virtual: true,
      summary: "Estado de execução em tmpfs (PIDs, sockets); apagado a cada inicialização.",
      command: "ls /run/systemd",
    },
    { name: "srv", summary: "Dados servidos pelo sistema (sites, FTP), por convenção." },
    {
      name: "sys",
      virtual: true,
      summary: "Modelo de dispositivos do kernel (sysfs): hardware, drivers e cgroups.",
      command: "cat /sys/class/net/eth0/speed",
      children: [
        {
          name: "fs",
          summary: "Inclui /sys/fs/cgroup: limites de CPU e memória dos contêineres.",
          command: "cat /sys/fs/cgroup/memory.max",
        },
      ],
    },
    {
      name: "tmp",
      summary: "Arquivos temporários, limpos periodicamente (muitas vezes tmpfs).",
      security: "Sticky bit (1777): todos escrevem, mas só o dono apaga o próprio arquivo.",
      command: "stat -c '%A %a' /tmp",
    },
    {
      name: "usr",
      summary: "Programas e dados somente leitura, compartilháveis entre máquinas.",
      children: [
        {
          name: "bin",
          summary: "Quase todos os comandos do usuário.",
          command: "ls /usr/bin | wc -l",
        },
        { name: "lib", summary: "Bibliotecas, units padrão do systemd e módulos." },
        {
          name: "local",
          summary:
            "Software instalado manualmente pelo administrador; nunca tocado pelo gerenciador de pacotes.",
        },
        {
          name: "share",
          summary: "Dados independentes de arquitetura: man pages, ícones, fusos horários.",
        },
      ],
    },
    {
      name: "var",
      summary: "Dados variáveis: logs, filas, caches e estado de aplicações.",
      children: [
        {
          name: "log",
          summary: "Logs em texto e o journal persistente (/var/log/journal).",
          command: "journalctl -p err -b",
        },
        {
          name: "lib",
          summary: "Estado persistente de serviços: /var/lib/docker, /var/lib/postgresql.",
          command: "sudo du -sh /var/lib/docker",
        },
        { name: "cache", summary: "Cache regenerável (pode ser apagado sem perda de dados)." },
      ],
    },
  ],
};

export interface FsEntry {
  path: string;
  depth: number;
  node: FsNode;
}

export function joinPath(parent: string, name: string): string {
  if (name === "/") return "/";
  return parent === "/" ? `/${name}` : `${parent}/${name}`;
}

/** Lista todos os nós com caminho absoluto (pré-ordem). */
export function flattenFs(root: FsNode = FS_ROOT): FsEntry[] {
  const out: FsEntry[] = [];
  const visit = (node: FsNode, parent: string, depth: number) => {
    const path = depth === 0 ? "/" : joinPath(parent, node.name);
    out.push({ path, depth, node });
    node.children?.forEach((child) => visit(child, path, depth + 1));
  };
  visit(root, "", 0);
  return out;
}

export function findFsNode(path: string, root: FsNode = FS_ROOT): FsNode | undefined {
  return flattenFs(root).find((entry) => entry.path === path)?.node;
}

/** Caminhos ancestrais, da raiz ao próprio caminho: "/etc/ssh" → ["/", "/etc", "/etc/ssh"]. */
export function ancestors(path: string): string[] {
  if (path === "/") return ["/"];
  const parts = path.split("/").filter(Boolean);
  return ["/", ...parts.map((_, index) => `/${parts.slice(0, index + 1).join("/")}`)];
}
