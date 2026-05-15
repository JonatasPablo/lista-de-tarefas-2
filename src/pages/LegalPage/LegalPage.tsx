import { Link } from 'react-router-dom'
import {
    APP_DEVELOPER,
    APP_NAME,
    COOKIES_POLICY_VERSION,
    LGPD_CONTACT_EMAIL,
    PRIVACY_POLICY_VERSION,
    TERMS_VERSION,
} from '../../config/app'
import './LegalPage.css'

type LegalPageType = 'privacidade' | 'termos' | 'cookies' | 'contato-lgpd'

type LegalSection = {
    title: string
    paragraphs: string[]
}

interface LegalPageProps {
    type: LegalPageType
}

const DATA_ATUALIZACAO = '14/05/2026'

const legalDocs: Record<
    LegalPageType,
    {
        eyebrow: string
        title: string
        version: string
        intro: string
        sections: LegalSection[]
    }
> = {
    privacidade: {
        eyebrow: 'Transparência e proteção de dados',
        title: 'Política de Privacidade',
        version: PRIVACY_POLICY_VERSION,
        intro:
            'Esta política explica, em linguagem simples, como o sistema trata dados pessoais para permitir o uso da Lista de Tarefas.',
        sections: [
            {
                title: 'Responsável pelo sistema',
                paragraphs: [
                    `O responsável pelo ${APP_NAME} é ${APP_DEVELOPER}. Para solicitações de privacidade, use o e-mail ${LGPD_CONTACT_EMAIL}.`,
                ],
            },
            {
                title: 'Dados coletados',
                paragraphs: [
                    'Podemos coletar nome, e-mail, senha criptografada, provedor de login, data de cadastro, confirmação de e-mail, versões aceitas dos termos e da política de privacidade, IP e navegador usados no aceite.',
                    'Durante o uso, o sistema também armazena tarefas, descrições, prioridades, prazos, histórico, logs de ações, anexos enviados pelo usuário e dados técnicos necessários para autenticação e segurança.',
                ],
            },
            {
                title: 'Finalidades',
                paragraphs: [
                    'Usamos esses dados para criar e manter sua conta, autenticar acessos, confirmar e-mail, permitir a criação e gestão das suas tarefas, exibir histórico e logs, proteger anexos e prevenir uso indevido.',
                    'Também usamos dados de contato para enviar códigos de confirmação de e-mail e redefinição de senha quando você solicita ou quando o fluxo de cadastro exige.',
                ],
            },
            {
                title: 'Base legal',
                paragraphs: [
                    'O tratamento pode ocorrer para execução do serviço solicitado por você, cumprimento de obrigações legais ou regulatórias, exercício regular de direitos e legítimo interesse em manter segurança, prevenção a fraudes e funcionamento adequado do sistema.',
                    'Quando houver aceite de termos ou políticas, registramos esse aceite para demonstrar transparência e consentimento quando aplicável.',
                ],
            },
            {
                title: 'Armazenamento e segurança',
                paragraphs: [
                    'Os dados ficam armazenados em banco de dados e arquivos protegidos por autenticação e controles de acesso. Senhas são armazenadas em formato criptografado, e tokens de sessão não devem ser expostos no frontend.',
                    'Anexos permanecem vinculados ao usuário e às tarefas correspondentes. O acesso deve ser permitido apenas ao usuário autenticado dono dos dados.',
                ],
            },
            {
                title: 'Compartilhamento',
                paragraphs: [
                    'Não vendemos dados pessoais. Dados podem ser compartilhados apenas com provedores necessários para hospedar o sistema, enviar e-mails, autenticar login externo quando usado, manter infraestrutura ou cumprir obrigação legal.',
                    'Quando você usa login com Google, o sistema recebe dados básicos fornecidos pelo provedor, como nome, e-mail verificado e identificador da conta.',
                ],
            },
            {
                title: 'Retenção',
                paragraphs: [
                    'Os dados são mantidos enquanto a conta estiver ativa e pelo tempo necessário para funcionamento do serviço, segurança, auditoria, cumprimento legal ou exercício de direitos.',
                    'Solicitações de exclusão serão avaliadas conforme a legislação aplicável e limitações técnicas ou legais existentes.',
                ],
            },
            {
                title: 'Direitos do titular',
                paragraphs: [
                    `Você pode solicitar acesso, correção ou exclusão de dados pessoais pelo e-mail ${LGPD_CONTACT_EMAIL}. Também pode pedir informações sobre tratamento, compartilhamento e retenção dos seus dados.`,
                    'Antes de atender uma solicitação, poderemos pedir informações para confirmar sua identidade e proteger sua conta.',
                ],
            },
            {
                title: 'Versão e atualização',
                paragraphs: [
                    `Versão ${PRIVACY_POLICY_VERSION}. Atualizada em ${DATA_ATUALIZACAO}. Esta política pode ser revisada para refletir mudanças no sistema, na operação ou na legislação.`,
                ],
            },
        ],
    },
    termos: {
        eyebrow: 'Regras de uso do sistema',
        title: 'Termos de Uso',
        version: TERMS_VERSION,
        intro:
            'Estes termos descrevem as condições básicas para uso da Lista de Tarefas.',
        sections: [
            {
                title: 'Finalidade do sistema',
                paragraphs: [
                    `O ${APP_NAME} é uma ferramenta para organização de tarefas, histórico, logs e anexos relacionados às tarefas do usuário.`,
                ],
            },
            {
                title: 'Conta e responsabilidades',
                paragraphs: [
                    'O usuário deve informar dados corretos, manter sua senha em segurança, não compartilhar acesso com terceiros e comunicar suspeitas de uso indevido.',
                    'Contas criadas com login externo dependem também das regras e disponibilidade do provedor utilizado.',
                ],
            },
            {
                title: 'Uso permitido',
                paragraphs: [
                    'O sistema deve ser usado para fins lícitos, pessoais ou profissionais, relacionados à organização de tarefas e informações próprias do usuário.',
                    'É proibido tentar invadir, explorar falhas, prejudicar a operação, automatizar abuso, enviar conteúdo malicioso ou usar o serviço para fins ilegais.',
                ],
            },
            {
                title: 'Segurança da conta',
                paragraphs: [
                    'O acesso à conta depende de autenticação. O usuário é responsável por manter a confidencialidade da senha e por usar dispositivos confiáveis sempre que possível.',
                    'O sistema pode exigir confirmação de e-mail e pode limitar acessos quando houver indícios de uso indevido.',
                ],
            },
            {
                title: 'Anexos',
                paragraphs: [
                    'Anexos devem estar relacionados às tarefas do usuário e não podem conter conteúdo ilegal, malicioso, ofensivo ou que viole direitos de terceiros.',
                    'O usuário é responsável pelo conteúdo que envia. O sistema pode restringir tipos, tamanho ou quantidade de arquivos para preservar segurança e estabilidade.',
                ],
            },
            {
                title: 'Limitações do serviço',
                paragraphs: [
                    'O sistema é fornecido para auxiliar na organização de tarefas. Não há promessa de disponibilidade contínua, ausência total de erros ou adequação a todos os usos específicos.',
                    'Podem ocorrer manutenções, indisponibilidades, ajustes técnicos ou mudanças de funcionalidades.',
                ],
            },
            {
                title: 'Suspensão ou exclusão',
                paragraphs: [
                    'Quando aplicável, contas podem ser suspensas, limitadas ou excluídas em caso de uso indevido, risco de segurança, violação destes termos ou solicitação do próprio usuário.',
                    'Solicitações relacionadas à conta e aos dados podem ser enviadas ao canal LGPD informado no sistema.',
                ],
            },
            {
                title: 'Versão e atualização',
                paragraphs: [
                    `Versão ${TERMS_VERSION}. Atualizada em ${DATA_ATUALIZACAO}. Estes termos podem ser atualizados para refletir mudanças do sistema ou novas necessidades operacionais.`,
                ],
            },
        ],
    },
    cookies: {
        eyebrow: 'Sessão, armazenamento local e PWA',
        title: 'Política de Cookies',
        version: COOKIES_POLICY_VERSION,
        intro:
            'Esta política explica o uso de cookies e tecnologias semelhantes na Lista de Tarefas.',
        sections: [
            {
                title: 'Cookies essenciais',
                paragraphs: [
                    'O sistema usa cookie essencial de sessão/autenticação para manter o usuário conectado com segurança. Esse cookie é necessário para o funcionamento do login e das áreas protegidas.',
                    'Esse cookie pode ser configurado com proteção HttpOnly no backend, reduzindo exposição por scripts no navegador.',
                ],
            },
            {
                title: 'localStorage e sessionStorage',
                paragraphs: [
                    'O frontend pode usar localStorage para preferências e controle técnico, como tema visual e versão do app usada para atualização de cache.',
                    'Esses dados não devem conter senha, token de sessão ou informações sensíveis.',
                ],
            },
            {
                title: 'PWA, service worker e cache',
                paragraphs: [
                    'Como o sistema possui recursos de PWA, o navegador pode manter arquivos estáticos em cache, como HTML, JavaScript, CSS, ícones e imagens públicas.',
                    'Esse cache melhora carregamento e experiência de uso. Em atualizações de versão, o app pode limpar caches antigos e recarregar a aplicação.',
                ],
            },
            {
                title: 'Analytics e marketing',
                paragraphs: [
                    'Neste bloco inicial, não há indicação de cookies de analytics ou marketing no frontend do sistema.',
                    'Se ferramentas desse tipo forem adicionadas no futuro, esta política deverá ser atualizada para explicar finalidade, fornecedor e opções de controle.',
                ],
            },
            {
                title: 'Gerenciamento pelo navegador',
                paragraphs: [
                    'Você pode gerenciar, bloquear ou apagar cookies e dados locais nas configurações do seu navegador.',
                    'Ao bloquear cookies essenciais, o login e áreas autenticadas podem deixar de funcionar corretamente.',
                ],
            },
            {
                title: 'Versão e atualização',
                paragraphs: [
                    `Versão ${COOKIES_POLICY_VERSION}. Atualizada em ${DATA_ATUALIZACAO}. Esta política pode ser revisada quando houver mudanças em cookies, armazenamento local ou PWA.`,
                ],
            },
        ],
    },
    'contato-lgpd': {
        eyebrow: 'Canal de privacidade',
        title: 'Contato LGPD',
        version: PRIVACY_POLICY_VERSION,
        intro:
            'Use este canal para solicitações relacionadas aos seus dados pessoais.',
        sections: [
            {
                title: 'Como solicitar',
                paragraphs: [
                    `Envie um e-mail para ${LGPD_CONTACT_EMAIL} informando sua solicitação de privacidade.`,
                    'Você pode solicitar acesso, correção ou exclusão de dados pessoais. Também pode pedir informações sobre uso, compartilhamento e retenção dos seus dados.',
                ],
            },
            {
                title: 'Confirmação de identidade',
                paragraphs: [
                    'Para proteger sua conta, poderemos solicitar informações adicionais antes de atender ao pedido.',
                    'O atendimento dependerá das informações fornecidas, das limitações técnicas do sistema e das obrigações legais aplicáveis.',
                ],
            },
        ],
    },
}

export const LegalPage = ({ type }: LegalPageProps) => {
    const doc = legalDocs[type]

    return (
        <main className="legal-page">
            <article className="legal-card">
                <header className="legal-header">
                    <span>{doc.eyebrow}</span>
                    <h2>{doc.title}</h2>
                    <p>{doc.intro}</p>
                    <strong>
                        Versão {doc.version} · Atualizada em{' '}
                        {DATA_ATUALIZACAO}
                    </strong>
                </header>

                <nav className="legal-doc-nav" aria-label="Páginas legais">
                    <Link to="/privacidade">Privacidade</Link>
                    <Link to="/termos">Termos</Link>
                    <Link to="/cookies">Cookies</Link>
                    <Link to="/contato-lgpd">Contato LGPD</Link>
                </nav>

                <div className="legal-content">
                    {doc.sections.map((section) => (
                        <section key={section.title} className="legal-section">
                            <h3>{section.title}</h3>
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </section>
                    ))}
                </div>
            </article>
        </main>
    )
}
