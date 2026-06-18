import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 p-8 sm:p-12 rounded-2xl shadow-xl">
        <header className="border-b border-zinc-800 pb-6 mb-8">
          <Link href="/login" className="text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-1 mb-4">
            ← Voltar para o Cadastro
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Política de <span className="text-amber-500">Privacidade</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Última atualização: 18 de Junho de 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Introdução</h2>
            <p>
              A <strong>Barbearia do Zé</strong> valoriza a sua privacidade. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nosso sistema de agendamentos e cadastro.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Informações que Coletamos</h2>
            <p>
              Para prestar nossos serviços de agendamento de forma eficiente, coletamos as seguintes informações fornecidas voluntariamente por você ao criar sua conta:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Nome Completo;</li>
              <li>Endereço de E-mail;</li>
              <li>Número de Telefone/Telemóvel;</li>
              <li>Dados de Agendamento (data, horário, serviço escolhido e barbeiro de preferência).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Como Utilizamos Seus Dados</h2>
            <p>
              Seus dados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Processar e gerenciar seus agendamentos na barbearia;</li>
              <li>Enviar notificações ou confirmações importantes relacionadas aos seus agendamentos;</li>
              <li>Garantir a segurança da sua conta e evitar fraudes no sistema;</li>
              <li>Entrar em contato para avisar sobre alterações de horários ou imprevistos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Proteção de Dados e Armazenamento</h2>
            <p>
              Adotamos práticas adequadas de segurança para proteger seus dados contra acessos não autorizados, alterações ou divulgações indesejadas. Seus dados de senha são armazenados de forma criptografada em nosso banco de dados. Nunca compartilhamos suas informações pessoais com terceiros ou anunciantes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento. Para isso, você pode visualizar seus dados na sua página de Perfil ou entrar em contato direto com a nossa administração.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">6. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade ocasionalmente. Quando fizermos alterações, a data da última atualização no início deste documento será modificada. Recomendamos revisar esta política periodicamente.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-500">
              Caso tenha dúvidas sobre como lidamos com seus dados de privacidade, fale conosco pelo e-mail: <span className="text-amber-500">contatctmarcioflima@gmail.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
