const puppeteer = require('puppeteer');

async function runE2E() {
  console.log('=== INICIANDO TESTES AUTOMATIZADOS DE CLIQUE NO FRONTEND ===');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: false, // Executa com a janela visível na tela
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[BROWSER ERROR] ${err.toString()}`));

  page.on('dialog', async dialog => {
    console.log(`[ALERTA DETECTADO] Confirmando: "${dialog.message()}"`);
    await dialog.accept();
  });

  const clearSession = async () => {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => localStorage.clear());
  };

  const executeSchedulingFlow = async (viewportName, width, height, userEmail, userName) => {
    console.log(`\n--- INICIANDO FLUXO: ${viewportName} (${width}x${height}) ---`);
    
    await page.setViewport({ width, height, isMobile: width < 600, hasTouch: width < 600 });
    
    await clearSession();
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('button');

    console.log('Alternando para tela de Registo...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Crie uma agora'));
      if (btn) btn.click();
    });
    
    await page.waitForSelector('input[placeholder="Ex: João Silva"]');
    
    const randomPhone = `9${Math.floor(10000000 + Math.random() * 90000000)}`;
    console.log(`Preenchendo formulário de registo para: ${userName} (Tel: ${randomPhone})...`);
    await page.type('input[placeholder="Ex: João Silva"]', userName);
    await page.type('input[placeholder="Ex: 81999999999"]', randomPhone);
    await page.type('input[placeholder="exemplo@email.com"]', userEmail);
    await page.type('input[placeholder="••••••••"]', 'password123');

    console.log('Submetendo cadastro...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Criar Conta'));
      if (btn) btn.click();
    });

    console.log('Aguardando carregamento da Página de Agendamento...');
    await page.waitForSelector('label[class*="cursor-pointer"]', { timeout: 15000 });
    console.log('Página de Agendamento carregada.');

    console.log('Selecionando primeiro serviço do catálogo...');
    const serviceLabels = await page.$$('label[class*="cursor-pointer"]');
    await serviceLabels[0].click();

    console.log('Selecionando primeiro barbeiro disponível...');
    await page.waitForSelector('select');
    const barberSelectValue = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select.options[1].value;
    });
    await page.select('select', barberSelectValue);

    console.log('Escolhendo primeiro dia útil disponível...');
    await page.waitForSelector('button[class*="w-16"]');
    const dayButtons = await page.$$('button[class*="w-16"]');
    await dayButtons[0].click();

    console.log('Escolhendo primeiro horário livre do dia...');
    await page.waitForSelector('div[class*="grid-cols-1"] button[class*="w-full"]');
    const timeButtons = await page.$$('div[class*="grid-cols-1"] button[class*="w-full"]');
    await timeButtons[0].click();

    console.log('Confirmando agendamento...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Confirmar Agendamento'));
      if (btn) btn.click();
    });

    console.log('Aguardando redirecionamento para o Perfil...');
    await page.waitForSelector('button', { timeout: 15000 });
    console.log('Página do Perfil carregada.');

    console.log('Verificando agendamento ativo e testando cancelamento...');
    await new Promise(r => setTimeout(r, 1000));

    const clickedCancel = await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Cancelar'));
      if (cancelBtn) {
        cancelBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedCancel) {
      throw new Error('Erro: Botão de Cancelamento de agendamento não encontrado no perfil!');
    }

    console.log('Cancelamento acionado. Aguardando atualização...');
    await new Promise(r => setTimeout(r, 2000));
    
    const statusText = await page.evaluate(() => {
      return document.body.innerText;
    });

    if (!statusText.includes('Cancelado')) {
      throw new Error('Erro: O status do agendamento não foi atualizado para "Cancelado" no perfil!');
    }
    console.log('Cancelamento confirmado e atualizado com sucesso visualmente!');

    console.log('Efetuando logout...');
    const loggedOut = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Sair'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!loggedOut) {
      throw new Error('Erro ao clicar no botão Sair (Logout).');
    }

    await page.waitForSelector('input[placeholder="exemplo@email.com"]', { timeout: 10000 });
    console.log(`Fluxo ${viewportName} concluído com sucesso!`);
  };

  try {
    const timestamp = Date.now();
    
    await executeSchedulingFlow(
      'VERSÃO MOBILE', 
      375, 
      812, 
      `mobile_user_${timestamp}@example.com`, 
      'Cliente Mobile E2E'
    );

    await executeSchedulingFlow(
      'VERSÃO DESKTOP', 
      1280, 
      800, 
      `desktop_user_${timestamp}@example.com`, 
      'Cliente Desktop E2E'
    );

    console.log('\n✅ TODOS OS TESTES VISUAIS FRONTEND PASSARAM COM SUCESSO!');
  } catch (error) {
    console.error('\n❌ O TESTE DE INTERFACE FALHOU:');
    console.error(error);
  } finally {
    console.log('Fechando o navegador...');
    await browser.close();
  }
}

runE2E();
