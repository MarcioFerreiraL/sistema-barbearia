import Link from "next/link";

export default function TermsOfUse() {
  return (
    <div className="px-4 py-12 md:py-16">
      <div className="folha mx-auto max-w-3xl p-6 sm:p-12">
        <header className="mb-8 border-b border-linha pb-6">
          <Link href="/login" className="btn-discreto mb-4 inline-block font-bold">
            Voltar para o cadastro
          </Link>
          <h1 className="titulo text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-2 text-apagado">Última atualização: 18 de Junho de 2026</p>
        </header>

        <div className="max-w-[68ch] space-y-8 text-lg leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Aceitação dos Termos</h2>
            <p>
              Ao se cadastrar e utilizar o sistema de agendamento online da <strong>Mandacaru Barbearia</strong>, você aceita e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer termo, solicitamos que não continue a utilização do sistema.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Cadastro de Usuário</h2>
            <p>
              Ao realizar o cadastro, você garante que:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-apagado">
              <li>Todas as informações fornecidas (Nome, E-mail, Telefone) são verdadeiras, precisas e atualizadas;</li>
              <li>A segurança de sua senha e o acesso à sua conta são de sua total responsabilidade. Caso perceba qualquer uso não autorizado, deve notificar a administração imediatamente.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Política de Agendamentos e Cancelamentos</h2>
            <p>
              Para garantir o melhor atendimento aos nossos clientes e parceiros:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-apagado">
              <li>Os horários reservados através da plataforma devem ser respeitados, tolerando-se um atraso máximo de 10 minutos;</li>
              <li>Caso precise cancelar ou remarcar o seu atendimento, solicitamos que o faça com antecedência mínima de 2 horas para viabilizar a vaga para outro cliente;</li>
              <li>O não comparecimento recorrente sem aviso prévio poderá resultar na suspensão temporária da funcionalidade de novos agendamentos online para sua conta.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Uso Adequado do Sistema</h2>
            <p>
              Você concorda em não tentar burlar os sistemas de segurança, realizar acessos de forma automatizada não permitida (como bots) ou tentar fazer mau uso do serviço de agendamentos para criar reservas falsas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Limitação de Responsabilidade</h2>
            <p>
              O sistema é disponibilizado “como está”, e trabalhamos continuamente para garantir estabilidade. No entanto, não nos responsabilizamos por instabilidades temporárias de conexão à internet, problemas técnicos de terceiros ou agendamentos perdidos devido a falhas fora do nosso controle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes Termos de Uso de tempos em tempos. Ao continuar a utilizar a plataforma após qualquer modificação, você estará aceitando os novos termos estabelecidos.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-linha text-center">
            <p className="text-sm text-apagado">
              Dúvidas ou esclarecimentos sobre nossos termos de uso? Entre em contato por meio de <span className="text-letreiro">contato@marciodev.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
