import Link from "next/link";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 p-8 sm:p-12 rounded-2xl shadow-xl">
        <header className="border-b border-zinc-800 pb-6 mb-8">
          <Link href="/login" className="text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-1 mb-4">
            ← Voltar para o Cadastro
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Termos de <span className="text-amber-500">Uso</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Última atualização: 18 de Junho de 2026</p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Aceitação dos Termos</h2>
            <p>
              Ao se cadastrar e utilizar o sistema de agendamento online da <strong>Barbearia do Zé</strong>, você aceita e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer termo, solicitamos que não continue a utilização do sistema.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Cadastro de Usuário</h2>
            <p>
              Ao realizar o cadastro, você garante que:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Todas as informações fornecidas (Nome, E-mail, Telefone) são verdadeiras, precisas e atualizadas;</li>
              <li>A segurança de sua senha e o acesso à sua conta são de sua total responsabilidade. Caso perceba qualquer uso não autorizado, deve notificar a administração imediatamente.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Política de Agendamentos e Cancelamentos</h2>
            <p>
              Para garantir o melhor atendimento aos nossos clientes e parceiros:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Os horários reservados através da plataforma devem ser respeitados, tolerando-se um atraso máximo de 10 minutos;</li>
              <li>Caso precise cancelar ou remarcar o seu atendimento, solicitamos que o faça com antecedência mínima de 2 horas para viabilizar a vaga para outro cliente;</li>
              <li>O não comparecimento recorrente sem aviso prévio poderá resultar na suspensão temporária da funcionalidade de novos agendamentos online para sua conta.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Uso Adequado do Sistema</h2>
            <p>
              Você concorda em não tentar burlar os sistemas de segurança, realizar acessos de forma automatizada não permitida (como bots) ou tentar fazer mau uso do serviço de agendamentos para criar reservas falsas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Limitação de Responsabilidade</h2>
            <p>
              O sistema é disponibilizado "como está", e trabalhamos continuamente para garantir estabilidade. No entanto, não nos responsabilizamos por instabilidades temporárias de conexão à internet, problemas técnicos de terceiros ou agendamentos perdidos devido a falhas fora do nosso controle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">6. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes Termos de Uso de tempos em tempos. Ao continuar a utilizar a plataforma após qualquer modificação, você estará aceitando os novos termos estabelecidos.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-500">
              Dúvidas ou esclarecimentos sobre nossos termos de uso? Entre em contato por meio de <span className="text-amber-500">contatctmarcioflima@gmail.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
