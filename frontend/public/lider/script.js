// ===== CARREGAR DADOS DO USUÁRIO =====
function carregarDadosUsuario() {
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  
  if (usuarioSalvo) {
    try {
      const usuario = JSON.parse(usuarioSalvo);
      
      // Preencher informações do perfil (editáveis)
      const perfilNome = document.getElementById('perfilNome');
      const perfilEmail = document.getElementById('perfilEmail');
      const perfilCargo = document.getElementById('perfilCargo');
      const perfilEmpresa = document.getElementById('perfilEmpresa');
      const perfilCnpj = document.getElementById('perfilCnpj');
      const perfilFuncao = document.getElementById('perfilFuncao');
      
      if (perfilNome) perfilNome.textContent = usuario.nome || 'Nome não disponível';
      if (perfilEmail) perfilEmail.textContent = usuario.email || 'Email não disponível';
      if (perfilCargo) perfilCargo.textContent = usuario.funcao || usuario.cargo || 'Líder de Empresa';
      if (perfilEmpresa) perfilEmpresa.textContent = usuario.nome_empresa || 'Digite o nome da empresa...';
      if (perfilCnpj) perfilCnpj.textContent = usuario.cnpj || 'Digite o CNPJ...';
      if (perfilFuncao) perfilFuncao.textContent = usuario.funcao || usuario.cargo || 'Digite sua função...';
      
      document.getElementById('perfilId').textContent = `#${usuario.id || 'N/A'}`;
      document.getElementById('perfilTipo').textContent = usuario.perfil === 'lider' ? 'Líder' : 'Colaborador';
      
      // Formatar CNPJ se disponível
      if (perfilCnpj && usuario.cnpj) {
        const cnpjFormatado = usuario.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        perfilCnpj.textContent = cnpjFormatado;
      }
      
      console.log('Dados do usuário carregados:', usuario);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      alert('Erro ao carregar informações do perfil');
    }
  } else {
    // Se não houver usuário logado, redirecionar para login
    window.location.href = '/';
  }
}

// ===== SALVAR ALTERAÇÕES DO PERFIL =====
function inicializarSalvarPerfil() {
  const btnSalvarPerfil = document.getElementById('btnSalvarPerfil');
  
  if (btnSalvarPerfil) {
    btnSalvarPerfil.addEventListener('click', async () => {
      const usuarioSalvo = localStorage.getItem('usuarioLogado');
      if (!usuarioSalvo) {
        alert('Erro: Usuário não encontrado');
        return;
      }
      
      try {
        const usuario = JSON.parse(usuarioSalvo);
        const usuarioId = usuario.id;
        
        // Coletar dados editados
        const nome = document.getElementById('perfilNome').textContent.trim();
        const email = document.getElementById('perfilEmail').textContent.trim();
        const funcao = document.getElementById('perfilFuncao').textContent.trim();
        const nomeEmpresa = document.getElementById('perfilEmpresa').textContent.trim();
        const cnpj = document.getElementById('perfilCnpj').textContent.trim();
        
        // Validações básicas
        if (!nome || nome === 'Nome não disponível') {
          alert('Por favor, preencha o nome.');
          return;
        }
        
        if (!email || email === 'Email não disponível' || !email.includes('@')) {
          alert('Por favor, preencha um e-mail válido.');
          return;
        }
        
        // Validar CNPJ (deve ter 14 dígitos ou estar vazio)
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo && cnpjLimpo.length !== 14) {
          alert('CNPJ deve conter 14 dígitos.');
          return;
        }
        
        // Preparar dados para atualização
        const dadosAtualizados = {
          nome,
          email,
          funcao: funcao === 'Digite sua função...' ? '' : funcao,
          nome_empresa: nomeEmpresa === 'Digite o nome da empresa...' ? '' : nomeEmpresa,
          cnpj: cnpjLimpo || null
        };
        
        // Atualizar no backend
        const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosAtualizados)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.erro || 'Erro ao atualizar perfil');
        }
        
        // Atualizar localStorage com dados atualizados
        const usuarioAtualizado = { ...usuario, ...dadosAtualizados };
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
        
        // Sincronizar cargo no topo com a função editada
        const perfilCargo = document.getElementById('perfilCargo');
        if (perfilCargo) perfilCargo.textContent = dadosAtualizados.funcao || 'Líder de Empresa';
        
        alert('Perfil atualizado com sucesso!');
        console.log('Perfil atualizado:', usuarioAtualizado);
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        alert(error.message || 'Erro ao salvar alterações. Tente novamente.');
      }
    });
  }
  
  // Adicionar máscara de CNPJ
  const perfilCnpj = document.getElementById('perfilCnpj');
  if (perfilCnpj) {
    perfilCnpj.addEventListener('input', (e) => {
      let value = e.target.textContent.replace(/\D/g, '');
      // Limitar a 14 dígitos
      if (value.length > 14) {
        value = value.substring(0, 14);
      }
      // Formatar apenas se tiver 14 dígitos
      if (value.length === 14) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      }
      e.target.textContent = value;
    });
    
    perfilCnpj.addEventListener('blur', (e) => {
      const texto = e.target.textContent.trim();
      const apenasNumeros = texto.replace(/\D/g, '');
      if (texto === '' || texto === 'Digite o CNPJ...' || apenasNumeros.length < 14) {
        if (apenasNumeros.length === 0) {
          e.target.textContent = 'Digite o CNPJ...';
        }
      }
    });
    
    perfilCnpj.addEventListener('focus', (e) => {
      if (e.target.textContent === 'Digite o CNPJ...') {
        e.target.textContent = '';
      }
    });
  }
  
  // Placeholder para campos editáveis
  const editaveis = document.querySelectorAll('.editable-profile');
  editaveis.forEach(el => {
    el.addEventListener('focus', function() {
      const placeholder = this.getAttribute('placeholder') || this.textContent;
      if (placeholder.includes('Digite') || placeholder.includes('Carregando') || placeholder.includes('não disponível')) {
        if (this.textContent === placeholder) {
          this.textContent = '';
        }
      }
    });
    
    el.addEventListener('blur', function() {
      if (this.textContent.trim() === '') {
        const field = this.getAttribute('data-field');
        if (field === 'nome_empresa') {
          this.textContent = 'Digite o nome da empresa...';
        } else if (field === 'cnpj') {
          this.textContent = 'Digite o CNPJ...';
        } else if (field === 'funcao') {
          this.textContent = 'Digite sua função...';
        }
      }
    });
  });
}

// ===== NAVEGAÇÃO ENTRE SEÇÕES =====
function inicializarNavegacao() {
  const navLinks = document.querySelectorAll('.sidebar-menu .nav-link[data-section]');
  const sections = document.querySelectorAll('.content-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remover classe active de todos os links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Adicionar classe active ao link clicado
      link.classList.add('active');
      
      // Esconder todas as seções
      sections.forEach(s => s.classList.add('d-none'));
      
      // Mostrar a seção correspondente
      const sectionId = link.getAttribute('data-section');
      const targetSection = document.getElementById(`section-${sectionId}`);
      
      if (targetSection) {
        targetSection.classList.remove('d-none');
      }
    });
  });
  
  // Por padrão, mostrar dashboard e marcar como ativo
  const dashboardSection = document.getElementById('section-dashboard');
  const dashboardLink = document.querySelector('[data-section="dashboard"]');
  if (dashboardSection && dashboardLink) {
    dashboardSection.classList.remove('d-none');
    // Remover active de todos e adicionar ao dashboard
    document.querySelectorAll('.sidebar-menu .nav-link[data-section]').forEach(l => l.classList.remove('active'));
    dashboardLink.classList.add('active');
  }
}

// ===== FUNCIONALIDADE DE PESQUISAR =====
function inicializarPesquisa() {
  const formPesquisar = document.getElementById('formPesquisar');
  const inputPesquisar = document.getElementById('inputPesquisar');
  const resultadosPesquisa = document.getElementById('resultadosPesquisa');
  
  if (formPesquisar) {
    formPesquisar.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const termo = inputPesquisar.value.trim().toLowerCase();
      
      if (termo === '') {
        resultadosPesquisa.innerHTML = '<p class="text-muted text-center">Digite algo para pesquisar...</p>';
        return;
      }
      
      // Simular pesquisa (aqui você pode fazer uma requisição ao backend)
      resultadosPesquisa.innerHTML = `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">
              <i class="fas fa-user me-2"></i>
              Resultados para "${termo}"
            </h5>
            <p class="text-muted">Funcionalidade de pesquisa será implementada com integração ao backend.</p>
            <ul class="list-group">
              <li class="list-group-item">
                <i class="fas fa-user me-2"></i>
                João Silva - Desenvolvedor
              </li>
              <li class="list-group-item">
                <i class="fas fa-user me-2"></i>
                Maria Oliveira - Analista
              </li>
            </ul>
          </div>
        </div>
      `;
    });
  }
}

// ===== FUNCIONALIDADE DE SAIR =====
function inicializarSair() {
  const btnSair = document.getElementById('btnSair');
  
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (confirm('Tem certeza que deseja sair?')) {
        // Limpar localStorage
        localStorage.removeItem('usuarioLogado');
        
        // Redirecionar para tela de login
        window.location.href = '/';
      }
    });
  }
}

// ===== ATUALIZAR CONTADORES =====
function atualizarContadores() {
  // Aqui você pode fazer uma requisição ao backend para obter dados reais
  // Por enquanto, usando valores estáticos
  const totalColaboradores = 4;
  const totalPendencias = 2;
  const totalOk = 2;
  const totalHoras = 430;
  
  document.getElementById('totalColaboradores').textContent = totalColaboradores;
  document.getElementById('totalPendencias').textContent = totalPendencias;
  document.getElementById('totalOk').textContent = totalOk;
  document.getElementById('totalHoras').textContent = `${totalHoras}h`;
}

// ===== NOTIFICAÇÕES =====
function inicializarNotificacoes() {
  // Aqui você pode adicionar lógica para buscar notificações do backend
  // Por enquanto, usando dados estáticos
  const badgeNotificacoes = document.getElementById('badgeNotificacoes');
  if (badgeNotificacoes) {
    badgeNotificacoes.textContent = '2';
  }
  
  // Inicializar funcionalidades do modal de mensagem
  inicializarModalMensagem();
}

// ===== MODAL DE MENSAGEM =====
let notificacaoAtual = null;

function inicializarModalMensagem() {
  // Event listeners para botões "Ver Detalhes"
  document.querySelectorAll('.btnVerMensagem').forEach(btn => {
    btn.addEventListener('click', function() {
      const notificacaoId = this.getAttribute('data-notificacao-id');
      const titulo = this.getAttribute('data-titulo');
      const mensagem = this.getAttribute('data-mensagem');
      const data = this.getAttribute('data-data');
      const tipo = this.getAttribute('data-tipo');
      const fixada = this.getAttribute('data-fixada') === 'true';
      
      abrirModalMensagem({
        id: notificacaoId,
        titulo: titulo,
        mensagem: mensagem,
        data: data,
        tipo: tipo,
        fixada: fixada
      });
    });
  });
  
  // Botão Responder
  const btnResponder = document.getElementById('btnResponder');
  if (btnResponder) {
    btnResponder.addEventListener('click', () => {
      const areaResposta = document.getElementById('areaResposta');
      if (areaResposta.style.display === 'none') {
        areaResposta.style.display = 'block';
        document.getElementById('textoResposta').focus();
      } else {
        areaResposta.style.display = 'none';
      }
    });
  }
  
  // Botão Cancelar Resposta
  const btnCancelarResposta = document.getElementById('btnCancelarResposta');
  if (btnCancelarResposta) {
    btnCancelarResposta.addEventListener('click', () => {
      document.getElementById('areaResposta').style.display = 'none';
      document.getElementById('textoResposta').value = '';
    });
  }
  
  // Botão Enviar Resposta
  const btnEnviarResposta = document.getElementById('btnEnviarResposta');
  if (btnEnviarResposta) {
    btnEnviarResposta.addEventListener('click', () => {
      const textoResposta = document.getElementById('textoResposta').value.trim();
      if (!textoResposta) {
        alert('Por favor, digite uma resposta antes de enviar.');
        return;
      }
      
      // Aqui você faria uma requisição ao backend para salvar a resposta
      console.log('Enviando resposta:', {
        notificacaoId: notificacaoAtual?.id,
        resposta: textoResposta
      });
      
      alert('Resposta enviada com sucesso!');
      document.getElementById('textoResposta').value = '';
      document.getElementById('areaResposta').style.display = 'none';
      
      // Fechar modal após enviar resposta
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalVerMensagem'));
      if (modal) {
        modal.hide();
      }
    });
  }
  
  // Botão Arquivar
  const btnArquivar = document.getElementById('btnArquivar');
  if (btnArquivar) {
    btnArquivar.addEventListener('click', () => {
      if (!notificacaoAtual) return;
      
      if (confirm('Deseja arquivar esta mensagem?')) {
        arquivarNotificacao(notificacaoAtual.id);
      }
    });
  }
  
  // Botão Lixeira
  const btnLixeira = document.getElementById('btnLixeira');
  if (btnLixeira) {
    btnLixeira.addEventListener('click', () => {
      if (!notificacaoAtual) return;
      
      if (confirm('Deseja enviar esta mensagem para a lixeira?')) {
        enviarParaLixeira(notificacaoAtual.id);
      }
    });
  }
  
  // Botão Fixar
  const btnFixar = document.getElementById('btnFixar');
  if (btnFixar) {
    btnFixar.addEventListener('click', () => {
      if (!notificacaoAtual) return;
      
      const fixada = notificacaoAtual.fixada;
      fixarNotificacao(notificacaoAtual.id, !fixada);
    });
  }
}

function abrirModalMensagem(notificacao) {
  notificacaoAtual = notificacao;
  
  // Preencher dados do modal
  document.getElementById('modalTitulo').textContent = notificacao.titulo;
  document.getElementById('modalMensagem').textContent = notificacao.mensagem;
  document.getElementById('modalData').textContent = notificacao.data;
  
  // Atualizar ícone baseado no tipo
  const modalIcon = document.getElementById('modalIcon');
  const icon = modalIcon.querySelector('i');
  
  if (notificacao.tipo === 'info') {
    modalIcon.style.background = '#2ecc71';
    icon.className = 'fas fa-info-circle';
  } else if (notificacao.tipo === 'warning') {
    modalIcon.style.background = '#f39c12';
    icon.className = 'fas fa-exclamation-triangle';
  } else if (notificacao.tipo === 'danger') {
    modalIcon.style.background = '#e74c3c';
    icon.className = 'fas fa-exclamation-circle';
  } else {
    modalIcon.style.background = '#27ae60';
    icon.className = 'fas fa-bell';
  }
  
  // Atualizar badge de fixada
  const badgeFixada = document.getElementById('badgeFixada');
  if (notificacao.fixada) {
    badgeFixada.style.display = 'inline-block';
  } else {
    badgeFixada.style.display = 'none';
  }
  
  // Atualizar texto do botão fixar
  const btnFixar = document.getElementById('btnFixar');
  if (notificacao.fixada) {
    btnFixar.innerHTML = '<i class="fas fa-thumbtack me-1"></i>Desfixar';
  } else {
    btnFixar.innerHTML = '<i class="fas fa-thumbtack me-1"></i>Fixar';
  }
  
  // Esconder área de resposta
  document.getElementById('areaResposta').style.display = 'none';
  document.getElementById('textoResposta').value = '';
  
  // Abrir modal
  const modal = new bootstrap.Modal(document.getElementById('modalVerMensagem'));
  modal.show();
}

function arquivarNotificacao(notificacaoId) {
  // Aqui você faria uma requisição ao backend para arquivar
  console.log('Arquivando notificação:', notificacaoId);
  
  // Simular arquivamento
  const notificacaoItem = document.querySelector(`[data-notificacao-id="${notificacaoId}"]`);
  if (notificacaoItem) {
    notificacaoItem.style.opacity = '0.5';
    notificacaoItem.style.textDecoration = 'line-through';
  }
  
  alert('Mensagem arquivada com sucesso!');
  
  // Fechar modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalVerMensagem'));
  if (modal) {
    modal.hide();
  }
}

function enviarParaLixeira(notificacaoId) {
  // Aqui você faria uma requisição ao backend para enviar para lixeira
  console.log('Enviando para lixeira:', notificacaoId);
  
  // Simular envio para lixeira
  const notificacaoItem = document.querySelector(`[data-notificacao-id="${notificacaoId}"]`);
  if (notificacaoItem) {
    notificacaoItem.remove();
  }
  
  alert('Mensagem enviada para a lixeira!');
  
  // Fechar modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalVerMensagem'));
  if (modal) {
    modal.hide();
  }
  
  // Atualizar contador de notificações
  atualizarContadorNotificacoes();
}

function fixarNotificacao(notificacaoId, fixar) {
  // Aqui você faria uma requisição ao backend para fixar/desfixar
  console.log(`${fixar ? 'Fixando' : 'Desfixando'} notificação:`, notificacaoId);
  
  // Atualizar estado local
  notificacaoAtual.fixada = fixar;
  
  // Atualizar badge no modal
  const badgeFixada = document.getElementById('badgeFixada');
  if (fixar) {
    badgeFixada.style.display = 'inline-block';
  } else {
    badgeFixada.style.display = 'none';
  }
  
  // Atualizar texto do botão
  const btnFixar = document.getElementById('btnFixar');
  if (fixar) {
    btnFixar.innerHTML = '<i class="fas fa-thumbtack me-1"></i>Desfixar';
  } else {
    btnFixar.innerHTML = '<i class="fas fa-thumbtack me-1"></i>Fixar';
  }
  
  // Atualizar atributo no botão da notificação
  const btnVerMensagem = document.querySelector(`.btnVerMensagem[data-notificacao-id="${notificacaoId}"]`);
  if (btnVerMensagem) {
    btnVerMensagem.setAttribute('data-fixada', fixar.toString());
  }
  
  // Mover notificação para o topo se fixada
  const notificacaoItem = document.querySelector(`[data-notificacao-id="${notificacaoId}"]`);
  if (notificacaoItem && fixar) {
    const cardBody = notificacaoItem.parentElement;
    cardBody.insertBefore(notificacaoItem, cardBody.firstChild);
    notificacaoItem.style.borderLeft = '4px solid #f39c12'; // Destaque visual
  }
  
  alert(`Mensagem ${fixar ? 'fixada' : 'desfixada'} com sucesso!`);
}

function atualizarContadorNotificacoes() {
  const notificacoes = document.querySelectorAll('.notificacao-item');
  const badgeNotificacoes = document.getElementById('badgeNotificacoes');
  
  if (badgeNotificacoes) {
    badgeNotificacoes.textContent = notificacoes.length;
    if (notificacoes.length === 0) {
      badgeNotificacoes.style.display = 'none';
    }
  }
}

// ===== CONFIGURAÇÕES =====
function inicializarConfiguracoes() {
  // Salvar preferências de notificações
  const notifEmail = document.getElementById('notifEmail');
  const notifPush = document.getElementById('notifPush');
  
  if (notifEmail) {
    notifEmail.addEventListener('change', (e) => {
      localStorage.setItem('notifEmail', e.target.checked);
    });
    
    // Carregar preferência salva
    const savedNotifEmail = localStorage.getItem('notifEmail');
    if (savedNotifEmail !== null) {
      notifEmail.checked = savedNotifEmail === 'true';
    }
  }
  
  if (notifPush) {
    notifPush.addEventListener('change', (e) => {
      localStorage.setItem('notifPush', e.target.checked);
    });
    
    // Carregar preferência salva
    const savedNotifPush = localStorage.getItem('notifPush');
    if (savedNotifPush !== null) {
      notifPush.checked = savedNotifPush === 'true';
    }
  }
  
  // Tema
  const temaClaro = document.getElementById('temaClaro');
  const temaEscuro = document.getElementById('temaEscuro');
  
  if (temaEscuro) {
    temaEscuro.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('tema', 'escuro');
      }
    });
  }
  
  if (temaClaro) {
    temaClaro.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('tema', 'claro');
      }
    });
  }
  
  // Carregar tema salvo
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'escuro') {
    temaEscuro.checked = true;
    document.body.classList.add('dark-theme');
  }
  
  // Botão alterar email
  const btnAlterarEmail = document.getElementById('btnAlterarEmail');
  if (btnAlterarEmail) {
    btnAlterarEmail.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('modalAlterarEmail'));
      modal.show();
    });
  }
  
  // Botão alterar celular
  const btnAlterarCelular = document.getElementById('btnAlterarCelular');
  if (btnAlterarCelular) {
    btnAlterarCelular.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('modalAlterarCelular'));
      modal.show();
    });
  }
  
  // Botão alterar senha
  const btnAlterarSenha = document.getElementById('btnAlterarSenha');
  if (btnAlterarSenha) {
    btnAlterarSenha.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('modalAlterarSenha'));
      modal.show();
    });
  }
  
  // Salvar email
  const btnSalvarEmail = document.getElementById('btnSalvarEmail');
  if (btnSalvarEmail) {
    btnSalvarEmail.addEventListener('click', async () => {
      const novoEmail = document.getElementById('novoEmail').value;
      const confirmarEmail = document.getElementById('confirmarEmail').value;
      const senhaAtual = document.getElementById('senhaAtualEmail').value;
      
      if (!novoEmail || !confirmarEmail || !senhaAtual) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      if (novoEmail !== confirmarEmail) {
        alert('Os e-mails não coincidem.');
        return;
      }
      
      if (!novoEmail.includes('@')) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }
      
      // Aqui você faria uma requisição ao backend
      alert('E-mail alterado com sucesso!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAlterarEmail'));
      modal.hide();
      document.getElementById('formAlterarEmail').reset();
    });
  }
  
  // Máscara para celular
  const novoCelularInput = document.getElementById('novoCelular');
  if (novoCelularInput) {
    novoCelularInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        if (value.length <= 2) {
          value = value;
        } else if (value.length <= 7) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
        e.target.value = value;
      }
    });
  }
  
  // Salvar celular
  const btnSalvarCelular = document.getElementById('btnSalvarCelular');
  if (btnSalvarCelular) {
    btnSalvarCelular.addEventListener('click', async () => {
      const novoCelular = document.getElementById('novoCelular').value;
      const senhaAtual = document.getElementById('senhaAtualCelular').value;
      
      if (!novoCelular || !senhaAtual) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      // Validar formato de celular (básico)
      const celularLimpo = novoCelular.replace(/\D/g, '');
      if (celularLimpo.length < 10 || celularLimpo.length > 11) {
        alert('Por favor, insira um número de celular válido.');
        return;
      }
      
      // Aqui você faria uma requisição ao backend
      alert('Número de celular alterado com sucesso!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAlterarCelular'));
      modal.hide();
      document.getElementById('formAlterarCelular').reset();
    });
  }
  
  // Salvar senha
  const btnSalvarSenha = document.getElementById('btnSalvarSenha');
  if (btnSalvarSenha) {
    btnSalvarSenha.addEventListener('click', async () => {
      const senhaAtual = document.getElementById('senhaAtual').value;
      const novaSenha = document.getElementById('novaSenha').value;
      const confirmarSenha = document.getElementById('confirmarSenha').value;
      
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      if (novaSenha.length < 6) {
        alert('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      
      if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
      }
      
      // Aqui você faria uma requisição ao backend
      alert('Senha alterada com sucesso!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAlterarSenha'));
      modal.hide();
      document.getElementById('formAlterarSenha').reset();
    });
  }
  
  // Verificação em duas etapas
  const verificacaoDuasEtapas = document.getElementById('verificacaoDuasEtapas');
  if (verificacaoDuasEtapas) {
    // Carregar estado salvo
    const duasEtapasAtivo = localStorage.getItem('verificacaoDuasEtapas') === 'true';
    verificacaoDuasEtapas.checked = duasEtapasAtivo;
    
    verificacaoDuasEtapas.addEventListener('change', (e) => {
      const ativo = e.target.checked;
      localStorage.setItem('verificacaoDuasEtapas', ativo.toString());
      
      if (ativo) {
        alert('Verificação em duas etapas ativada! Você receberá um código por e-mail/SMS ao fazer login.');
      } else {
        alert('Verificação em duas etapas desativada.');
      }
    });
  }
  
  console.log('Configurações inicializadas');
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando tela do líder...');
  
  // Carregar dados do usuário
  carregarDadosUsuario();
  
  // Inicializar navegação
  inicializarNavegacao();
  
  // Inicializar pesquisa
  inicializarPesquisa();
  
  // Inicializar sair
  inicializarSair();
  
  // Atualizar contadores
  atualizarContadores();
  
  // Inicializar notificações
  inicializarNotificacoes();
  
  // Inicializar configurações
  inicializarConfiguracoes();
  
  // Inicializar salvar perfil
  inicializarSalvarPerfil();
  
  // Carregar usuários da empresa
  carregarUsuarios();
  
  // Inicializar adicionar usuário
  inicializarAdicionarUsuario();
  
  // Inicializar editar usuário
  inicializarEditarUsuario();
  
  // Inicializar projetos
  inicializarProjetos();
  
  // Garantir que o sidebar fique sempre visível em telas grandes
  function ajustarSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    if (window.innerWidth >= 992 && sidebar) {
      sidebar.classList.add('show');
      sidebar.setAttribute('aria-modal', 'false');
    }
  }
  
  ajustarSidebar();
  window.addEventListener('resize', ajustarSidebar);
  
  // Inicializar funcionalidades de suporte
  inicializarSuporte();
  
  // Inicializar enviar mensagem
  inicializarEnviarMensagem();
  
  // Limpar formulário de mensagem quando o modal de detalhes for fechado
  const modalDetalhes = document.getElementById('modalDetalhesUsuario');
  if (modalDetalhes) {
    modalDetalhes.addEventListener('hidden.bs.modal', () => {
      // Limpar formulário
      document.getElementById('mensagemTitulo').value = '';
      document.getElementById('mensagemTexto').value = '';
      document.getElementById('mensagemDestinatarioId').value = '';
      
      // Remover qualquer alerta que possa estar visível
      const alertas = modalDetalhes.querySelectorAll('.alert');
      alertas.forEach(alerta => alerta.remove());
      
      // Reabilitar botão de enviar mensagem
      const btnEnviar = document.getElementById('btnEnviarMensagemColaborador');
      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensagem';
      }
    });
  }
  
  console.log('Tela do líder inicializada com sucesso!');
});

// ===== FUNCIONALIDADES DE SUPORTE =====
function inicializarSuporte() {
  const btnAbrirChat = document.getElementById('btnAbrirChat');
  const btnCentralAjuda = document.getElementById('btnCentralAjuda');
  
  if (btnAbrirChat) {
    btnAbrirChat.addEventListener('click', () => {
      alert('Funcionalidade de chat será implementada em breve. Por favor, entre em contato por e-mail ou telefone.');
    });
  }
  
  if (btnCentralAjuda) {
    btnCentralAjuda.addEventListener('click', () => {
      alert('Central de ajuda será implementada em breve.');
    });
  }
}

// ===== CARREGAR USUÁRIOS DA EMPRESA =====
async function carregarUsuarios() {
  const usuariosTableBody = document.getElementById('usuariosTableBody');
  
  if (!usuariosTableBody) return;
  
  try {
    // Fazer requisição ao backend para buscar usuários
    const response = await fetch('http://localhost:3000/usuarios');
    
    if (!response.ok) {
      throw new Error('Erro ao carregar usuários');
    }
    
    const usuarios = await response.json();
    
    if (usuarios.length === 0) {
      usuariosTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted">
            Nenhum usuário cadastrado ainda
          </td>
        </tr>
      `;
      return;
    }
    
    // Renderizar tabela de usuários
    usuariosTableBody.innerHTML = usuarios.map(usuario => {
      const totalHoras = '160h'; // Em produção, viria do backend
      const status = totalHoras === '160h' ? 'OK' : 'Pendente';
      const statusClass = status === 'OK' ? 'bg-success' : 'bg-warning';
      const funcao = usuario.funcao || 'Não definida';
      
      return `
        <tr>
          <td>#${usuario.id}</td>
          <td><strong>${usuario.nome}</strong></td>
          <td>${usuario.email}</td>
          <td>
            <span class="badge bg-secondary">${funcao}</span>
          </td>
          <td>
            <span class="badge ${usuario.perfil === 'lider' ? 'bg-success' : 'bg-info'}">
              ${usuario.perfil === 'lider' ? 'Líder' : 'Colaborador'}
            </span>
          </td>
          <td>${totalHoras}</td>
          <td>
            <span class="badge ${statusClass}">${status}</span>
          </td>
          <td>
            ${usuario.perfil === 'colaborador' ? `
              <button class="btn btn-sm btn-outline-success me-1" onclick="gerenciarProjetosUsuario(${usuario.id}, '${usuario.nome}')" title="Gerenciar Projetos">
                <i class="fas fa-folder-open"></i>
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-primary me-1" onclick="verDetalhesUsuario(${usuario.id})" title="Ver Detalhes">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning me-1" onclick="editarUsuario(${usuario.id})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirUsuario(${usuario.id})" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    console.log('Usuários carregados:', usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    usuariosTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger">
          Erro ao carregar usuários. Tente novamente mais tarde.
        </td>
      </tr>
    `;
  }
}

// ===== ADICIONAR USUÁRIO =====
function inicializarAdicionarUsuario() {
  const btnSalvarUsuario = document.getElementById('btnSalvarUsuario');
  const formAdicionarUsuario = document.getElementById('formAdicionarUsuario');
  
  if (btnSalvarUsuario) {
    btnSalvarUsuario.addEventListener('click', async () => {
      const nome = document.getElementById('novoUsuarioNome').value;
      const email = document.getElementById('novoUsuarioEmail').value;
      const senha = document.getElementById('novoUsuarioSenha').value;
      const funcao = document.getElementById('novoUsuarioFuncao').value;
      const perfil = document.getElementById('novoUsuarioPerfil').value;
      
      if (!nome || !email || !senha || !funcao || !perfil) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:3000/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nome, email, senha, funcao, perfil })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.erro || 'Erro ao cadastrar usuário');
        }
        
        alert('Usuário cadastrado com sucesso!');
        
        // Fechar modal
        const modalElement = document.getElementById('modalAdicionarUsuario');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
        
        // Limpar formulário
        if (formAdicionarUsuario) {
          formAdicionarUsuario.reset();
        }
        
        // Recarregar lista de usuários
        carregarUsuarios();
      } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        alert(error.message || 'Erro ao cadastrar usuário. Tente novamente.');
      }
    });
  }
}

// ===== EDITAR USUÁRIO =====
function inicializarEditarUsuario() {
  const btnSalvarEdicao = document.getElementById('btnSalvarEdicaoUsuario');
  if (!btnSalvarEdicao) return;

  btnSalvarEdicao.addEventListener('click', async () => {
    const id = document.getElementById('editarUsuarioId').value;
    const funcao = document.getElementById('editarUsuarioFuncao').value;
    const notificar = document.getElementById('editarUsuarioNotificar').checked;
    const nome = document.getElementById('editarUsuarioNome').value;

    if (!funcao) {
      alert('Por favor, selecione uma função.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcao })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Erro ao atualizar usuário');

      if (notificar) {
        await fetch('http://localhost:3000/notificacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinatario_id: parseInt(id),
            titulo: 'Sua função foi alterada',
            mensagem: `Seu líder atualizou sua função para: ${funcao}.`,
            tipo: 'info'
          })
        });
      }

      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
      if (modal) modal.hide();

      alert(notificar 
        ? 'Alterações salvas com sucesso! O colaborador foi notificado.' 
        : 'Alterações salvas com sucesso!');
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert(error.message || 'Erro ao atualizar usuário. Tente novamente.');
    }
  });
}

// ===== CARREGAR PROJETOS =====
async function carregarProjetos() {
  const projetosGrid = document.getElementById('projetosGrid');
  
  if (!projetosGrid) return;
  
  try {
    const response = await fetch('http://localhost:3000/projetos');
    
    if (!response.ok) {
      throw new Error('Erro ao carregar projetos');
    }
    
    const projetos = await response.json();
    
    if (projetos.length === 0) {
      projetosGrid.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="fas fa-folder-open fa-3x mb-3"></i>
          <p>Nenhum projeto cadastrado ainda.</p>
          <p>Clique em "Adicionar Projeto" para começar.</p>
        </div>
      `;
      return;
    }
    
    // Renderizar projetos com contagem de colaboradores
    const projetosComColaboradores = await Promise.all(
      projetos.map(async (projeto) => {
        try {
          const response = await fetch(`http://localhost:3000/projetos/${projeto.id}/colaboradores`);
          const colaboradores = await response.ok ? await response.json() : [];
          return { ...projeto, numColaboradores: colaboradores.length };
        } catch (error) {
          return { ...projeto, numColaboradores: 0 };
        }
      })
    );
    
    projetosGrid.innerHTML = projetosComColaboradores.map(projeto => {
      const dataInicio = projeto.data_inicio 
        ? new Date(projeto.data_inicio).toLocaleDateString('pt-BR')
        : 'Não definida';
      
      return `
        <div class="project-card" data-projeto-id="${projeto.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h3 class="mb-0">
              <span class="editable-title projeto-nome" contenteditable="true" data-field="nome" data-projeto-id="${projeto.id}">${projeto.nome || 'Sem nome'}</span>
            </h3>
            <div class="project-actions">
              <button class="btn btn-sm btn-outline-warning me-1" onclick="editarProjeto(${projeto.id})" title="Editar Projeto">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-info me-1" onclick="verColaboradoresProjeto(${projeto.id}, '${projeto.nome}')" title="Ver Colaboradores">
                <i class="fas fa-users"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="excluirProjeto(${projeto.id})" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p>
            <strong>Código:</strong>
            <span class="editable-text projeto-codigo" contenteditable="true" data-field="codigo" data-projeto-id="${projeto.id}">${projeto.codigo || 'Não definido'}</span>
          </p>
          <p>
            <strong>Início:</strong>
            <span class="data-projeto badge bg-secondary projeto-data" data-field="data_inicio" data-projeto-id="${projeto.id}">${dataInicio}</span>
          </p>
          <p>
            <strong>Colaboradores:</strong>
            <span class="badge bg-success">${projeto.numColaboradores || 0}</span>
          </p>
        </div>
      `;
    }).join('');
    
    // Adicionar listeners para edição inline
    inicializarEdicaoProjetos();
    
    console.log('Projetos carregados:', projetos);
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    projetosGrid.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
        <p>Erro ao carregar projetos. Tente novamente mais tarde.</p>
      </div>
    `;
  }
}

// ===== INICIALIZAR EDIÇÃO DE PROJETOS =====
function inicializarEdicaoProjetos() {
  // Edição de nome e código
  document.querySelectorAll('.editable-title.projeto-nome, .editable-text.projeto-codigo').forEach(el => {
    el.addEventListener('blur', async function() {
      const projetoId = this.getAttribute('data-projeto-id');
      const field = this.getAttribute('data-field');
      const value = this.textContent.trim();
      
      if (!value) {
        // Recarregar para restaurar valor original
        carregarProjetos();
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:3000/projetos/${projetoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [field]: value })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao atualizar projeto');
        }
        
        console.log(`Projeto ${projetoId} atualizado: ${field} = ${value}`);
      } catch (error) {
        console.error('Erro ao atualizar projeto:', error);
        alert('Erro ao salvar alterações. Tente novamente.');
        carregarProjetos(); // Recarregar para restaurar
      }
    });
  });
  
  // Edição de data
  document.querySelectorAll('.projeto-data').forEach(el => {
    el.addEventListener('click', function() {
      const projetoId = this.getAttribute('data-projeto-id');
      const dataAtual = this.textContent;
      
      // Criar input de data
      const input = document.createElement('input');
      input.type = 'date';
      input.className = 'form-control form-control-sm';
      input.value = dataAtual !== 'Não definida' ? converterDataBRParaISO(dataAtual) : '';
      
      this.textContent = '';
      this.appendChild(input);
      input.focus();
      
      input.addEventListener('blur', async function() {
        const novaData = this.value;
        const elemento = this.parentElement;
        
        if (novaData) {
          elemento.textContent = new Date(novaData).toLocaleDateString('pt-BR');
          
          try {
            const response = await fetch(`http://localhost:3000/projetos/${projetoId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ data_inicio: novaData })
            });
            
            if (!response.ok) {
              throw new Error('Erro ao atualizar projeto');
            }
            
            console.log(`Projeto ${projetoId} atualizado: data_inicio = ${novaData}`);
          } catch (error) {
            console.error('Erro ao atualizar projeto:', error);
            alert('Erro ao salvar alterações. Tente novamente.');
            carregarProjetos();
          }
        } else {
          elemento.textContent = dataAtual;
        }
      });
    });
  });
}

// ===== FUNÇÃO AUXILIAR PARA CONVERTER DATA =====
function converterDataBRParaISO(dataBR) {
  const partes = dataBR.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return '';
}

// ===== CARREGAR COLABORADORES NO MODAL =====
async function carregarColaboradoresNoModal(projetoId = null) {
  const container = document.getElementById('colaboradoresCheckboxContainer');
  
  try {
    // Buscar todos os colaboradores
    const response = await fetch('http://localhost:3000/usuarios');
    const usuarios = await response.json();
    const colaboradores = usuarios.filter(u => u.perfil === 'colaborador');
    
    if (colaboradores.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">Nenhum colaborador cadastrado ainda.</p>';
      return;
    }
    
    // Se estiver editando, buscar colaboradores já atribuídos
    let colaboradoresAtribuidos = [];
    if (projetoId) {
      try {
        const responseColab = await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores`);
        const colaboradoresAtribuidosData = await responseColab.json();
        colaboradoresAtribuidos = colaboradoresAtribuidosData.map(c => parseInt(c.id));
      } catch (error) {
        console.error('Erro ao carregar colaboradores do projeto:', error);
      }
    }
    
    // Renderizar checkboxes
    container.innerHTML = colaboradores.map(colab => {
      const colabId = parseInt(colab.id);
      const checked = colaboradoresAtribuidos.includes(colabId) ? 'checked' : '';
      return `
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" value="${colab.id}" id="colab_${colab.id}" ${checked}>
          <label class="form-check-label" for="colab_${colab.id}">
            ${colab.nome} ${colab.funcao ? `(${colab.funcao})` : ''}
          </label>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error);
    container.innerHTML = '<p class="text-danger text-center">Erro ao carregar colaboradores.</p>';
  }
}

// ===== INICIALIZAR MODAL DE PROJETO =====
function inicializarModalProjeto() {
  const btnAdicionarProjeto = document.getElementById('btnAdicionarProjeto');
  const btnSalvarProjeto = document.getElementById('btnSalvarProjeto');
  const formProjeto = document.getElementById('formProjeto');
  const modalElement = document.getElementById('modalProjeto');
  const modalProjeto = new bootstrap.Modal(modalElement);
  const modalTitle = document.getElementById('modalProjetoLabel');
  
  // Listener para quando o modal for fechado
  modalElement.addEventListener('hidden.bs.modal', () => {
    // Limpar formulário ao fechar
    formProjeto.reset();
    document.getElementById('projetoId').value = '';
    modalTitle.innerHTML = '<i class="fas fa-folder-open me-2"></i>Novo Projeto';
  });
  
  if (btnAdicionarProjeto) {
    btnAdicionarProjeto.addEventListener('click', async () => {
      // Limpar formulário
      formProjeto.reset();
      document.getElementById('projetoId').value = '';
      modalTitle.innerHTML = '<i class="fas fa-folder-open me-2"></i>Novo Projeto';
      await carregarColaboradoresNoModal();
      modalProjeto.show();
    });
  }
  
  if (btnSalvarProjeto) {
    btnSalvarProjeto.addEventListener('click', async () => {
      const projetoId = document.getElementById('projetoId').value;
      const nome = document.getElementById('projetoNome').value.trim();
      const codigo = document.getElementById('projetoCodigo').value.trim();
      const dataInicio = document.getElementById('projetoDataInicio').value;
      
      // Obter colaboradores selecionados
      const checkboxes = document.querySelectorAll('#colaboradoresCheckboxContainer input[type="checkbox"]:checked');
      const colaboradoresIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
      
      if (!nome) {
        alert('Por favor, preencha o nome do projeto.');
        return;
      }
      
      if (colaboradoresIds.length === 0) {
        alert('Por favor, selecione pelo menos um colaborador para o projeto.');
        return;
      }
      
      try {
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
        
        if (projetoId) {
          // Atualizar projeto existente
          const response = await fetch(`http://localhost:3000/projetos/${projetoId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, codigo, data_inicio: dataInicio || null })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.erro || 'Erro ao atualizar projeto');
          }
          
          // Atualizar colaboradores do projeto
          // Primeiro, buscar colaboradores atuais
          const responseAtuais = await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores`);
          const colaboradoresAtuais = await responseAtuais.json();
          const idsAtuais = colaboradoresAtuais.map(c => parseInt(c.id));
          
          // Remover colaboradores que foram desmarcados
          for (const idAtual of idsAtuais) {
            if (!colaboradoresIds.includes(idAtual)) {
              await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores/${idAtual}`, {
                method: 'DELETE'
              });
            }
          }
          
          // Adicionar novos colaboradores
          for (const idNovo of colaboradoresIds) {
            if (!idsAtuais.includes(idNovo)) {
              await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores/${idNovo}`, {
                method: 'POST'
              });
            }
          }
          
          alert('Projeto atualizado com sucesso!');
        } else {
          // Criar novo projeto
          const response = await fetch('http://localhost:3000/projetos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              nome, 
              codigo: codigo || null, 
              data_inicio: dataInicio || null,
              criado_por: usuario?.id || null
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.erro || 'Erro ao criar projeto');
          }
          
          const novoProjetoId = data.projeto.id;
          
          // Atribuir colaboradores ao projeto
          for (const colaboradorId of colaboradoresIds) {
            await fetch(`http://localhost:3000/projetos/${novoProjetoId}/colaboradores/${colaboradorId}`, {
              method: 'POST'
            });
          }
          
          alert('Projeto criado com sucesso!');
        }
        
        modalProjeto.hide();
        formProjeto.reset();
        document.getElementById('projetoId').value = '';
        modalTitle.innerHTML = '<i class="fas fa-folder-open me-2"></i>Novo Projeto';
        carregarProjetos();
      } catch (error) {
        console.error('Erro ao salvar projeto:', error);
        alert(error.message || 'Erro ao salvar projeto. Tente novamente.');
      }
    });
  }
}

// ===== EDITAR PROJETO =====
window.editarProjeto = async function(projetoId) {
  try {
    // Buscar dados do projeto
    const response = await fetch(`http://localhost:3000/projetos`);
    const projetos = await response.json();
    const projeto = projetos.find(p => p.id == projetoId);
    
    if (!projeto) {
      alert('Projeto não encontrado.');
      return;
    }
    
    // Preencher formulário
    document.getElementById('projetoId').value = projeto.id;
    document.getElementById('projetoNome').value = projeto.nome || '';
    document.getElementById('projetoCodigo').value = projeto.codigo || '';
    
    // Converter data para formato do input date (YYYY-MM-DD)
    if (projeto.data_inicio) {
      const dataParts = projeto.data_inicio.split('-');
      if (dataParts.length === 3) {
        document.getElementById('projetoDataInicio').value = projeto.data_inicio;
      } else {
        // Se estiver em formato BR, converter
        const dataBR = projeto.data_inicio.split('/');
        if (dataBR.length === 3) {
          document.getElementById('projetoDataInicio').value = `${dataBR[2]}-${dataBR[1]}-${dataBR[0]}`;
        }
      }
    } else {
      document.getElementById('projetoDataInicio').value = '';
    }
    
    // Atualizar título do modal
    document.getElementById('modalProjetoLabel').innerHTML = '<i class="fas fa-edit me-2"></i>Editar Projeto';
    
    // Carregar colaboradores com os já selecionados
    await carregarColaboradoresNoModal(projetoId);
    
    // Abrir modal
    const modalProjeto = new bootstrap.Modal(document.getElementById('modalProjeto'));
    modalProjeto.show();
    
  } catch (error) {
    console.error('Erro ao carregar projeto para edição:', error);
    alert('Erro ao carregar projeto. Tente novamente.');
  }
};

// ===== EXCLUIR PROJETO =====
window.excluirProjeto = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este projeto?')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/projetos/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao excluir projeto');
    }
    
    alert('Projeto excluído com sucesso!');
    carregarProjetos();
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    alert(error.message || 'Erro ao excluir projeto. Tente novamente.');
  }
};

// ===== INICIALIZAR PROJETOS =====
function inicializarProjetos() {
  carregarProjetos();
  inicializarModalProjeto();
}

// ===== FUNÇÕES DE AÇÃO DOS USUÁRIOS (GLOBAIS) =====
window.verDetalhesUsuario = async function(id) {
  try {
    // Buscar dados do usuário
    const response = await fetch(`http://localhost:3000/usuarios/${id}`);
    if (!response.ok) throw new Error('Usuário não encontrado');
    const usuario = await response.json();
    
    // Preencher informações no modal
    document.getElementById('detalhesNome').textContent = usuario.nome || 'Nome não disponível';
    document.getElementById('detalhesId').textContent = `#${usuario.id || 'N/A'}`;
    document.getElementById('detalhesEmail').textContent = usuario.email || 'Não disponível';
    document.getElementById('detalhesFuncao').textContent = usuario.funcao || 'Não definida';
    document.getElementById('detalhesFuncaoTexto').textContent = usuario.funcao || 'Não definida';
    document.getElementById('detalhesEmpresa').textContent = usuario.nome_empresa || 'Não informado';
    
    // Atualizar badge de perfil
    const detalhesPerfil = document.getElementById('detalhesPerfil');
    detalhesPerfil.textContent = usuario.perfil === 'lider' ? 'Líder' : 'Colaborador';
    if (usuario.perfil === 'lider') {
      detalhesPerfil.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
    } else {
      detalhesPerfil.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
    }
    
    // Formatar data de cadastro
    if (usuario.data_cadastro) {
      const data = new Date(usuario.data_cadastro);
      document.getElementById('detalhesDataCadastro').textContent = 
        data.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
    } else {
      document.getElementById('detalhesDataCadastro').textContent = 'Não disponível';
    }
    
    // Carregar foto do colaborador (buscar do localStorage)
    const fotoSalva = localStorage.getItem(`fotoPerfil_${id}`);
    const avatarImg = document.getElementById('detalhesAvatarImg');
    const avatarIcon = document.getElementById('detalhesAvatarIcon');
    
    if (fotoSalva && fotoSalva.trim() !== '') {
      avatarImg.src = fotoSalva;
      avatarImg.style.display = 'block';
      avatarImg.style.width = '150px';
      avatarImg.style.height = '150px';
      avatarImg.style.borderRadius = '50%';
      avatarImg.style.objectFit = 'cover';
      avatarImg.style.border = '4px solid #27ae60';
      avatarIcon.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarIcon.style.display = 'block';
      avatarIcon.className = 'fas fa-user-circle fa-5x';
      avatarIcon.style.color = '#27ae60';
    }
    
    // Total de horas (em produção viria do backend)
    document.getElementById('detalhesTotalHoras').textContent = '160h'; // Placeholder
    
    // Definir ID do destinatário para mensagem
    document.getElementById('mensagemDestinatarioId').value = id;
    
    // Limpar formulário de mensagem
    document.getElementById('mensagemTitulo').value = '';
    document.getElementById('mensagemTexto').value = '';
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalhesUsuario'));
    modal.show();
  } catch (error) {
    console.error('Erro ao carregar detalhes do usuário:', error);
    alert('Erro ao carregar dados do usuário. Tente novamente.');
  }
};

window.editarUsuario = async function(id) {
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${id}`);
    if (!response.ok) throw new Error('Usuário não encontrado');
    const usuario = await response.json();
    
    // Verificar se é colaborador (só permite editar função de colaboradores)
    if (usuario.perfil === 'lider') {
      alert('A função de líderes não pode ser editada através desta interface.');
      return;
    }
    
    document.getElementById('editarUsuarioId').value = usuario.id;
    document.getElementById('editarUsuarioNome').value = usuario.nome || '';
    document.getElementById('editarUsuarioEmail').value = usuario.email || '';
    document.getElementById('editarUsuarioFuncao').value = usuario.funcao || '';
    document.getElementById('editarUsuarioNotificar').checked = false;
    
    // Atualizar título do modal
    document.getElementById('modalEditarUsuarioLabel').innerHTML = 
      '<i class="fas fa-user-edit me-2"></i>Editar Função do Colaborador';
    
    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
    alert('Erro ao carregar dados do usuário. Tente novamente.');
  }
};

window.excluirUsuario = async function(id) {
  if (!confirm(`Tem certeza que deseja excluir o usuário #${id}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao excluir usuário');
    }
    
    alert('Usuário excluído com sucesso!');
    carregarUsuarios();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    alert(error.message || 'Erro ao excluir usuário. Tente novamente.');
  }
};

// ===== ENVIAR MENSAGEM AO COLABORADOR =====
function inicializarEnviarMensagem() {
  const btnEnviarMensagem = document.getElementById('btnEnviarMensagemColaborador');
  
  if (btnEnviarMensagem) {
    btnEnviarMensagem.addEventListener('click', async () => {
      const destinatarioId = document.getElementById('mensagemDestinatarioId').value;
      const titulo = document.getElementById('mensagemTitulo').value.trim();
      const mensagem = document.getElementById('mensagemTexto').value.trim();
      
      if (!titulo || !mensagem) {
        alert('Por favor, preencha o título e a mensagem.');
        return;
      }
      
      if (!destinatarioId) {
        alert('Erro: Destinatário não identificado.');
        return;
      }
      
      // Desabilitar botão durante o envio
      btnEnviarMensagem.disabled = true;
      btnEnviarMensagem.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
      
      try {
        const response = await fetch('http://localhost:3000/notificacoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            destinatario_id: parseInt(destinatarioId),
            titulo: titulo,
            mensagem: mensagem,
            tipo: 'info'
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.erro || 'Erro ao enviar mensagem');
        }
        
        // Mostrar mensagem de sucesso
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
          <i class="fas fa-check-circle me-2"></i>
          <strong>Sucesso!</strong> Mensagem enviada com sucesso ao colaborador.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Inserir alerta antes do formulário
        const formEnviarMensagem = document.getElementById('formEnviarMensagem');
        formEnviarMensagem.parentNode.insertBefore(alertDiv, formEnviarMensagem);
        
        // Remover alerta após 5 segundos
        setTimeout(() => {
          alertDiv.remove();
        }, 5000);
        
        // Limpar formulário
        document.getElementById('mensagemTitulo').value = '';
        document.getElementById('mensagemTexto').value = '';
        
        // Reabilitar botão
        btnEnviarMensagem.disabled = false;
        btnEnviarMensagem.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensagem';
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        alert(error.message || 'Erro ao enviar mensagem. Tente novamente.');
        
        // Reabilitar botão em caso de erro
        btnEnviarMensagem.disabled = false;
        btnEnviarMensagem.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensagem';
      }
    });
  }
}

// ===== GERENCIAR PROJETOS DO COLABORADOR =====
window.gerenciarProjetosUsuario = async function(colaboradorId, nomeColaborador) {
  const modalElement = document.getElementById('modalProjetosColaborador');
  const modal = new bootstrap.Modal(modalElement);
  const nomeColaboradorModal = document.getElementById('nomeColaboradorModal');
  const selectProjeto = document.getElementById('selectProjetoParaAdicionar');
  const projetosLista = document.getElementById('projetosColaboradorLista');
  
  nomeColaboradorModal.textContent = nomeColaborador;
  // Armazenar colaboradorId no modal para uso posterior
  modalElement.dataset.colaboradorId = colaboradorId;
  
  // Carregar todos os projetos disponíveis
  try {
    const responseProjetos = await fetch('http://localhost:3000/projetos');
    const todosProjetos = await responseProjetos.json();
    
    // Carregar projetos do colaborador
    const responseColaborador = await fetch(`http://localhost:3000/colaboradores/${colaboradorId}/projetos`);
    const projetosColaborador = await responseColaborador.json();
    const idsProjetosColaborador = projetosColaborador.map(p => p.id);
    
    // Preencher select com projetos não atribuídos
    selectProjeto.innerHTML = '<option value="">Selecione um projeto...</option>';
    todosProjetos.forEach(projeto => {
      if (!idsProjetosColaborador.includes(projeto.id)) {
        selectProjeto.innerHTML += `<option value="${projeto.id}">${projeto.nome}${projeto.codigo ? ' - ' + projeto.codigo : ''}</option>`;
      }
    });
    
    // Preencher lista de projetos atribuídos
    if (projetosColaborador.length === 0) {
      projetosLista.innerHTML = '<p class="text-muted text-center">Nenhum projeto atribuído ainda.</p>';
    } else {
      projetosLista.innerHTML = projetosColaborador.map(projeto => {
        const dataInicio = projeto.data_inicio 
          ? new Date(projeto.data_inicio).toLocaleDateString('pt-BR')
          : 'Não definida';
        
        return `
          <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">${projeto.nome}</h6>
              <small class="text-muted">Código: ${projeto.codigo || 'Não definido'} | Início: ${dataInicio}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="removerProjetoColaborador(${projeto.id}, ${colaboradorId})">
              <i class="fas fa-times"></i>
              Remover
            </button>
          </div>
        `;
      }).join('');
    }
    
    modal.show();
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    alert('Erro ao carregar projetos. Tente novamente.');
  }
};

// ===== ADICIONAR PROJETO AO COLABORADOR =====
document.addEventListener('DOMContentLoaded', () => {
  const btnAdicionarProjetoColaborador = document.getElementById('btnAdicionarProjetoColaborador');
  
  if (btnAdicionarProjetoColaborador) {
    btnAdicionarProjetoColaborador.addEventListener('click', async () => {
      const selectProjeto = document.getElementById('selectProjetoParaAdicionar');
      const projetoId = selectProjeto.value;
      
      if (!projetoId) {
        alert('Por favor, selecione um projeto.');
        return;
      }
      
      // Obter colaboradorId do modal (precisamos armazenar isso)
      const modal = document.getElementById('modalProjetosColaborador');
      const colaboradorId = modal.dataset.colaboradorId;
      
      if (!colaboradorId) {
        alert('Erro: ID do colaborador não encontrado.');
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores/${colaboradorId}`, {
          method: 'POST'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.erro || 'Erro ao atribuir projeto');
        }
        
        alert('Projeto atribuído com sucesso!');
        
        // Recarregar projetos do colaborador
        const nomeColaborador = document.getElementById('nomeColaboradorModal').textContent;
        gerenciarProjetosUsuario(parseInt(colaboradorId), nomeColaborador);
      } catch (error) {
        console.error('Erro ao adicionar projeto:', error);
        alert(error.message || 'Erro ao adicionar projeto. Tente novamente.');
      }
    });
  }
});

// ===== REMOVER PROJETO DO COLABORADOR =====
window.removerProjetoColaborador = async function(projetoId, colaboradorId) {
  if (!confirm('Tem certeza que deseja remover este projeto do colaborador?')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores/${colaboradorId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao remover projeto');
    }
    
    alert('Projeto removido com sucesso!');
    
    // Recarregar projetos do colaborador
    const nomeColaborador = document.getElementById('nomeColaboradorModal').textContent;
    gerenciarProjetosUsuario(colaboradorId, nomeColaborador);
  } catch (error) {
    console.error('Erro ao remover projeto:', error);
    alert(error.message || 'Erro ao remover projeto. Tente novamente.');
  }
};

// ===== VER COLABORADORES DO PROJETO =====
window.verColaboradoresProjeto = async function(projetoId, nomeProjeto) {
  const modalElement = document.getElementById('modalColaboradoresProjeto');
  const modal = new bootstrap.Modal(modalElement);
  const nomeProjetoModal = document.getElementById('nomeProjetoModal');
  const colaboradoresLista = document.getElementById('colaboradoresProjetoLista');
  
  nomeProjetoModal.textContent = nomeProjeto;
  
  try {
    const response = await fetch(`http://localhost:3000/projetos/${projetoId}/colaboradores`);
    const colaboradores = await response.json();
    
    if (colaboradores.length === 0) {
      colaboradoresLista.innerHTML = '<p class="text-muted text-center">Nenhum colaborador atribuído a este projeto.</p>';
    } else {
      colaboradoresLista.innerHTML = colaboradores.map(colab => {
        const dataAtribuicao = colab.data_atribuicao 
          ? new Date(colab.data_atribuicao).toLocaleDateString('pt-BR')
          : 'Não disponível';
        
        return `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">${colab.nome}</h6>
                <small class="text-muted">${colab.email} | ${colab.funcao || 'Sem função'} | Atribuído em: ${dataAtribuicao}</small>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    modal.show();
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error);
    alert('Erro ao carregar colaboradores do projeto.');
  }
};

// ===== PREVENIR ACESSO SEM LOGIN =====
window.addEventListener('load', () => {
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  
  if (!usuarioSalvo) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = '/';
  }
});
