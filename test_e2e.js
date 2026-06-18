/**
 * E2E Integration Test Script for Sistema Barbearia
 * Uses Native Node.js Fetch to test the API flow.
 */

const BASE_URL = 'http://localhost:8080/api';

function getNextDateTimeForDayOfWeek(dayOfWeek, openTime) {
  const date = new Date();
  // Target: 1 (Mon) - 7 (Sun)
  // JS Day: 0 (Sun) - 6 (Sat)
  const targetJsDay = dayOfWeek === 7 ? 0 : dayOfWeek;
  
  // Advance date to target day
  for (let i = 0; i < 7; i++) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() === targetJsDay) {
      break;
    }
  }
  
  const dateString = date.toISOString().split('T')[0];
  // Format as ISO LocalDateTime: YYYY-MM-DDTHH:MM:SS
  return `${dateString}T${openTime}`;
}

async function runTests() {
  console.log('=== INICIANDO TESTES DE INTEGRAÇÃO E2E ===\n');

  // 1. REGISTAR UM NOVO CLIENTE
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `test_user_${randomSuffix}@example.com`;
  const registerPayload = {
    fullName: `Test User ${randomSuffix}`,
    email: email,
    phoneNumber: `9${randomSuffix.toString().padStart(8, '0')}`,
    password: 'password123'
  };

  console.log(`[1] Registando cliente: ${email}...`);
  const registerRes = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });

  if (!registerRes.ok) {
    const errorText = await registerRes.text();
    throw new Error(`Falha ao registar cliente: ${errorText}`);
  }

  const newCustomer = await registerRes.json();
  console.log('Cliente registado com sucesso:', newCustomer);
  console.log(`ID do cliente gerado: ${newCustomer.id}\n`);

  // 2. EFETUAR LOGIN (Verificando Cookie HttpOnly e JSON JWT)
  console.log('[2] Efetuando login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: registerPayload.email,
      password: registerPayload.password
    })
  });

  if (!loginRes.ok) {
    const errorText = await loginRes.text();
    throw new Error(`Falha no login: ${errorText}`);
  }

  const setCookieHeader = loginRes.headers.get('set-cookie');
  console.log('Cabeçalho Set-Cookie recebido:', setCookieHeader);
  if (!setCookieHeader || !setCookieHeader.includes('token=')) {
    throw new Error('Erro: O cookie HTTP-Only "token" não foi enviado pelo servidor no login!');
  }
  console.log('Cookie HttpOnly definido corretamente.');

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Token JWT recebido no corpo da resposta:', token);

  // Decodificar o JWT para verificar claims (id, email/sub, role)
  const tokenPayloadBase64 = token.split('.')[1];
  const claims = JSON.parse(Buffer.from(tokenPayloadBase64, 'base64').toString('utf8'));
  console.log('JWT Claims decodificadas:');
  console.log(` - ID: ${claims.id}`);
  console.log(` - Email (sub): ${claims.sub}`);
  console.log(` - Role: ${claims.role}`);

  if (!claims.id) throw new Error('Erro: Falha na validação das Claims. Campo ID ausente!');
  if (!claims.role) throw new Error('Erro: Falha na validação das Claims. Campo Role ausente!');
  if (claims.sub !== email) throw new Error('Erro: Campo sub no JWT não bate com o email registado!');
  console.log('Claims validadas com sucesso (ID, Email e Role presentes).\n');

  // Guardar o Cookie de Sessão
  const sessionCookie = setCookieHeader.split(';')[0];

  // 3. RECUPERAR HORÁRIOS DE FUNCIONAMENTO (Business Hours)
  console.log('[3] Consultando horários de funcionamento da barbearia...');
  const hoursRes = await fetch(`${BASE_URL}/business-hours`, {
    headers: {
      'Cookie': sessionCookie
    }
  });

  if (!hoursRes.ok) {
    throw new Error(`Falha ao obter horários: ${await hoursRes.text()}`);
  }

  const businessHours = await hoursRes.json();
  const openDay = businessHours.find(h => h.open === true);
  if (!openDay) {
    throw new Error('Erro: Nenhuma configuração de dia aberto no banco de dados!');
  }
  console.log(`Dia de funcionamento selecionado para teste: ${openDay.dayName} (Dia da semana: ${openDay.dayOfWeek})`);
  console.log(`Horário: ${openDay.openTime} às ${openDay.closeTime}\n`);

  // 4. RECUPERAR BARBEIROS E SERVIÇOS
  console.log('[4] Carregando barbeiros e serviços...');
  const barbersRes = await fetch(`${BASE_URL}/barbers`, {
    headers: { 'Cookie': sessionCookie }
  });
  const servicesRes = await fetch(`${BASE_URL}/services`, {
    headers: { 'Cookie': sessionCookie }
  });

  if (!barbersRes.ok || !servicesRes.ok) {
    throw new Error('Erro ao carregar barbeiros/serviços.');
  }

  const barbers = await barbersRes.json();
  const services = await servicesRes.json();

  const activeBarber = barbers.find(b => b.active);
  const activeService = services.find(s => s.active);

  if (!activeBarber || !activeService) {
    throw new Error('Nenhum barbeiro ou serviço ativo no banco de dados!');
  }

  console.log(`Barbeiro selecionado: ${activeBarber.fullName} (ID: ${activeBarber.id})`);
  console.log(`Serviço selecionado: ${activeService.name} (ID: ${activeService.id})\n`);

  // 5. EFETUAR UM AGENDAMENTO SEGURO
  const scheduledTime = getNextDateTimeForDayOfWeek(openDay.dayOfWeek, openDay.openTime);
  console.log(`[5] Agendando corte para ${scheduledTime}...`);

  const appointmentPayload = {
    customerId: newCustomer.id,
    barberId: activeBarber.id,
    serviceItemId: activeService.id,
    startTime: scheduledTime
  };

  const apptRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify(appointmentPayload)
  });

  if (!apptRes.ok) {
    throw new Error(`Falha ao criar agendamento: ${await apptRes.text()}`);
  }

  const appointment = await apptRes.json();
  console.log('Agendamento criado com sucesso:', appointment);
  console.log(`ID do agendamento: ${appointment.id}\n`);

  // 6. TESTAR CONFLITO DE HORÁRIO (DOUBLE-BOOKING)
  console.log('[6] Testando agendamento duplicado no mesmo horário (conflito)...');
  const duplicateApptRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify(appointmentPayload)
  });

  console.log(`Status de resposta do agendamento duplicado: ${duplicateApptRes.status}`);
  if (duplicateApptRes.ok) {
    throw new Error('Erro: O sistema permitiu agendamento duplicado para o mesmo barbeiro no mesmo horário!');
  }
  console.log('Sucesso: O sistema barrou corretamente a tentativa de agendamento duplicado!\n');

  // 7. FINALIZAR O AGENDAMENTO (COMPLETE)
  console.log(`[7] Testando finalização do agendamento (Complete) ID: ${appointment.id}...`);
  const completeRes = await fetch(`${BASE_URL}/appointments/${appointment.id}/complete`, {
    method: 'PATCH',
    headers: { 'Cookie': sessionCookie }
  });

  if (!completeRes.ok) {
    throw new Error(`Erro ao finalizar agendamento: ${await completeRes.text()}`);
  }
  console.log('Agendamento marcado como concluído com sucesso.');

  // Verificar o status atualizado do agendamento
  const checkApptRes = await fetch(`${BASE_URL}/appointments/${appointment.id}`, {
    headers: { 'Cookie': sessionCookie }
  });
  const checkAppt = await checkApptRes.json();
  console.log(`Status atual do agendamento no banco de dados: ${checkAppt.status}`);
  if (checkAppt.status !== 'COMPLETED') {
    throw new Error('Erro: O status do agendamento não foi atualizado para COMPLETED!');
  }
  console.log('Status COMPLETED verificado com sucesso.\n');

  // 8. EFETUAR LOGOUT E TESTAR BLOQUEIO DE ACESSO
  console.log('[8] Efetuando logout e limpando cookies...');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Cookie': sessionCookie }
  });

  if (!logoutRes.ok) {
    throw new Error('Falha ao efetuar logout.');
  }

  const logoutCookieHeader = logoutRes.headers.get('set-cookie');
  console.log('Cabeçalho Set-Cookie no logout:', logoutCookieHeader);
  if (!logoutCookieHeader || !logoutCookieHeader.includes('Max-Age=0')) {
    throw new Error('Erro: O cookie não foi invalidado apropriadamente no logout (Max-Age=0 ausente)!');
  }
  console.log('Cookie invalidado remotamente com sucesso.');

  // Testar requisição sem cookie / após logout
  const expiredCookie = logoutCookieHeader.split(';')[0];
  console.log('Efetuando chamada protegida após logout...');
  const protectedCallRes = await fetch(`${BASE_URL}/customers`, {
    headers: { 'Cookie': expiredCookie }
  });

  console.log(`Status da chamada pós-logout: ${protectedCallRes.status}`);
  if (protectedCallRes.status !== 401 && protectedCallRes.status !== 403) {
    throw new Error(`Erro: Chamada protegida retornou status ${protectedCallRes.status} em vez de 401/403!`);
  }
  console.log('Sucesso: Acesso bloqueado conforme esperado após logout.');

  console.log('\n=== TODOS OS TESTES PASSARAM COM SUCESSO! ===');
}

runTests().catch(err => {
  console.error('\n❌ O TESTE DE INTEGRAÇÃO FALHOU:');
  console.error(err);
  process.exit(1);
});
