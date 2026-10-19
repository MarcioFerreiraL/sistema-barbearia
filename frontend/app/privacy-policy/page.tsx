import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="px-4 py-12 md:py-16">
      <div className="folha mx-auto max-w-3xl p-6 sm:p-12">
        <header className="mb-8 border-b border-linha pb-6">
          <Link href="/login" className="btn-discreto mb-4 inline-block font-bold">
            Voltar para o cadastro
          </Link>
          <h1 className="titulo text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-apagado">Última atualização: 18 de Junho de 2026</p>
        </header>

        <div className="max-w-[68ch] space-y-8 text-lg leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Introdução</h2>
            <p>
              A <strong>Mandacaru Barbearia</strong> valoriza a sua privacidade. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nosso sistema de agendamentos e cadastro.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Informações que Coletamos</h2>
            <p>
              Para prestar nossos serviços de agendamento de forma eficiente, coletamos as seguintes informações fornecidas voluntariamente por você ao criar sua conta:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-apagado">
              <li>Nome Completo;</li>
              <li>Endereço de E-mail;</li>
              <li>Número de Telefone/Telemóvel;</li>
              <li>Dados de Agendamento (data, horário, serviço escolhido e barbeiro de preferência).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Como Utilizamos Seus Dados</h2>
            <p>
              Seus dados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-apagado">
              <li>Processar e gerenciar seus agendamentos na barbearia;</li>
              <li>Enviar notificações ou confirmações importantes relacionadas aos seus agendamentos;</li>
              <li>Garantir a segurança da sua conta e evitar fraudes no sistema;</li>
              <li>Entrar em contato para avisar sobre alterações de horários ou imprevistos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Proteção de Dados e Armazenamento</h2>
            <p>
              Adotamos práticas adequadas de segurança para proteger seus dados contra acessos não autorizados, alterações ou divulgações indesejadas. Seus dados de senha são armazenados de forma criptografada em nosso banco de dados. Nunca compartilhamos suas informações pessoais com terceiros ou anunciantes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento. Para isso, você pode visualizar seus dados na sua página de Perfil ou entrar em contato direto com a nossa administração.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade ocasionalmente. Quando fizermos alterações, a data da última atualização no início deste documento será modificada. Recomendamos revisar esta política periodicamente.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-linha text-center">
            <p className="text-sm text-apagado">
              Caso tenha dúvidas sobre como lidamos com seus dados de privacidade, fale conosco pelo e-mail: <span className="text-letreiro">contato@marciodev.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
