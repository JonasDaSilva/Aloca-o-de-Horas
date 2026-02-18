// ===== FUNÇÕES DE DATA E HORA =====
function dataHojeBR() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function horaAgora() {
  const agora = new Date();
  return agora.toTimeString().slice(0, 5);
}

function paraMinutos(hora) {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosParaHora(minutos) {
  if (minutos < 0) return "00:00";
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// ===== CALCULAR TOTAL DO DIA =====
function calcularTotalDia() {
  const entrada = document.getElementById('entrada');
  const almocoSaida = document.getElementById('almocoSaida');
  const almocoVolta = document.getElementById('almocoVolta');
  const saida = document.getElementById('saida');
  const totalEl = document.querySelector('.total');

  if (!entrada.value || !almocoSaida.value || !almocoVolta.value || !saida.value) {
    totalEl.textContent = "00:00";
    return;
  }

  const minutosEntrada = paraMinutos(entrada.value);
  const minutosSaida = paraMinutos(saida.value);
  const minutosAlmocoSaida = paraMinutos(almocoSaida.value);
  const minutosAlmocoVolta = paraMinutos(almocoVolta.value);

  const totalMinutos = (minutosSaida - minutosEntrada) - (minutosAlmocoVolta - minutosAlmocoSaida);

  if (totalMinutos < 0) {
    totalEl.textContent = "Erro";
    totalEl.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    return;
  }

  totalEl.textContent = minutosParaHora(totalMinutos);
  totalEl.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
}

// ===== CARREGAR DADOS DO USUÁRIO =====
function carregarDadosUsuario() {
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  
  if (usuarioSalvo) {
    try {
      const usuario = JSON.parse(usuarioSalvo);
      
      // Preencher nome do colaborador
      document.getElementById('nomeColaborador').textContent = usuario.nome || 'Nome não disponível';
      
      // Preencher informações do sidebar
      const sidebarNome = document.getElementById('sidebarNomeColaborador');
      const sidebarEmail = document.getElementById('sidebarEmailColaborador');
      if (sidebarNome) sidebarNome.textContent = usuario.nome || 'Nome não disponível';
      if (sidebarEmail) sidebarEmail.textContent = usuario.email || 'Email não disponível';
      
      // Preencher informações do perfil
      if (document.getElementById('perfilNome')) {
        document.getElementById('perfilNome').textContent = usuario.nome || 'Nome não disponível';
        document.getElementById('perfilEmail').textContent = usuario.email || 'Email não disponível';
        document.getElementById('perfilId').textContent = `#${usuario.id || 'N/A'}`;
        
        // Preencher função (Nome Função)
        const perfilFuncao = document.getElementById('perfilFuncao');
        if (perfilFuncao) {
          perfilFuncao.textContent = usuario.funcao || 'Não informado';
        }
        
        // Preencher empresa (somente leitura para colaborador)
        const perfilEmpresa = document.getElementById('perfilEmpresa');
        if (perfilEmpresa) {
          perfilEmpresa.textContent = usuario.nome_empresa || 'Não informado';
        }
        
        // Carregar foto de perfil
        carregarFotoPerfil(usuario.id);
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

// ===== SINCRONIZAR DADOS DO USUÁRIO COM O BACKEND =====
async function sincronizarDadosUsuario() {
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  
  if (!usuarioSalvo) return;
  
  try {
    const usuario = JSON.parse(usuarioSalvo);
    const usuarioId = usuario.id;
    
    // Buscar dados atualizados do backend
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}`);
    
    if (!response.ok) {
      console.warn('Erro ao sincronizar dados do usuário:', response.status);
      return;
    }
    
    const usuarioAtualizado = await response.json();
    
    // Comparar dados para verificar se houve mudanças
    const houveMudanca = 
      usuario.nome !== usuarioAtualizado.nome ||
      usuario.email !== usuarioAtualizado.email ||
      usuario.funcao !== usuarioAtualizado.funcao ||
      usuario.nome_empresa !== usuarioAtualizado.nome_empresa;
    
    if (houveMudanca) {
      // Atualizar localStorage com dados atualizados
      const usuarioCompleto = { ...usuario, ...usuarioAtualizado };
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioCompleto));
      
      // Atualizar interface apenas se a função mudou (ou outros campos relevantes)
      if (usuario.funcao !== usuarioAtualizado.funcao) {
        const perfilFuncao = document.getElementById('perfilFuncao');
        if (perfilFuncao) {
          perfilFuncao.textContent = usuarioAtualizado.funcao || 'Não informado';
        }
        console.log('Função atualizada automaticamente:', usuarioAtualizado.funcao);
      }
      
      // Atualizar outros campos se necessário
      if (usuario.nome !== usuarioAtualizado.nome) {
        document.getElementById('nomeColaborador').textContent = usuarioAtualizado.nome || 'Nome não disponível';
        const sidebarNome = document.getElementById('sidebarNomeColaborador');
        if (sidebarNome) sidebarNome.textContent = usuarioAtualizado.nome || 'Nome não disponível';
        const perfilNome = document.getElementById('perfilNome');
        if (perfilNome) perfilNome.textContent = usuarioAtualizado.nome || 'Nome não disponível';
      }
      
      if (usuario.email !== usuarioAtualizado.email) {
        const sidebarEmail = document.getElementById('sidebarEmailColaborador');
        if (sidebarEmail) sidebarEmail.textContent = usuarioAtualizado.email || 'Email não disponível';
        const perfilEmail = document.getElementById('perfilEmail');
        if (perfilEmail) perfilEmail.textContent = usuarioAtualizado.email || 'Email não disponível';
      }
      
      if (usuario.nome_empresa !== usuarioAtualizado.nome_empresa) {
        const perfilEmpresa = document.getElementById('perfilEmpresa');
        if (perfilEmpresa) {
          perfilEmpresa.textContent = usuarioAtualizado.nome_empresa || 'Não informado';
        }
      }
      
      console.log('Dados sincronizados com sucesso');
    }
  } catch (error) {
    console.error('Erro ao sincronizar dados do usuário:', error);
  }
}

// ===== ATUALIZAR SIDEBAR COM INFORMAÇÕES DINÂMICAS =====
function atualizarSidebar() {
  // Atualizar total de horas do dia
  const totalHoje = document.querySelector('.total');
  const sidebarTotalHoje = document.getElementById('sidebarTotalHoje');
  if (totalHoje && sidebarTotalHoje) {
    sidebarTotalHoje.textContent = totalHoje.textContent || '00:00';
  }
  
  // Atualizar banco de horas no sidebar
  const bancoTotalHoras = document.getElementById('bancoTotalHoras');
  const sidebarBancoHoras = document.getElementById('sidebarBancoHoras');
  if (bancoTotalHoras && sidebarBancoHoras) {
    sidebarBancoHoras.textContent = bancoTotalHoras.textContent || '0h';
  }
}

// ===== INICIALIZAR REGISTRO DE HORAS =====
function inicializarRegistroHoras() {
  const entrada = document.getElementById('entrada');
  const dataAtual = document.getElementById('dataAtual');
  
  // Definir hora de entrada automática
  if (entrada) {
    entrada.value = horaAgora();
    entrada.disabled = true;
  }
  
  // Mostrar data atual
  if (dataAtual) {
    dataAtual.textContent = dataHojeBR();
  }
  
  // Adicionar listeners para calcular total
  const campos = ['almocoSaida', 'almocoVolta', 'saida'];
  campos.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener('change', () => {
        calcularTotalDia();
        atualizarSidebar();
      });
      campo.addEventListener('input', () => {
        calcularTotalDia();
        atualizarSidebar();
      });
    }
  });
  
  // Inicializar datas nos projetos e atividades
  const hoje = dataHojeBR();
  document.querySelectorAll('.data-projeto').forEach(el => {
    el.textContent = hoje;
  });
  
  document.querySelectorAll('.data-reuniao').forEach(el => {
    el.textContent = hoje;
  });
  
  document.querySelectorAll('.data-atividade').forEach(el => {
    el.textContent = hoje;
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
  
  // Por padrão, mostrar registro de horas
  document.getElementById('section-registro').classList.remove('d-none');
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

// ===== FECHAR DIA =====
function inicializarFecharDia() {
  const btnFecharDia = document.querySelector('.fechar-dia');
  
  if (btnFecharDia) {
    btnFecharDia.addEventListener('click', () => {
      const entrada = document.getElementById('entrada').value;
      const almocoSaida = document.getElementById('almocoSaida').value;
      const almocoVolta = document.getElementById('almocoVolta').value;
      const saida = document.getElementById('saida').value;
      const total = document.querySelector('.total').textContent;
      
      if (!almocoSaida || !almocoVolta || !saida) {
        alert('Por favor, preencha todos os campos de horário antes de fechar o dia.');
        return;
      }
      
      if (total === 'Erro' || total === '00:00') {
        alert('Por favor, verifique os horários inseridos. O total calculado está inválido.');
        return;
      }
      
      // Aqui você pode fazer uma requisição ao backend para salvar os dados
      const dadosDia = {
        data: dataHojeBR(),
        entrada: entrada,
        almocoSaida: almocoSaida,
        almocoVolta: almocoVolta,
        saida: saida,
        total: total
      };
      
      console.log('Fechando dia com os seguintes dados:', dadosDia);
      
      // Simular salvamento (aqui você faria a requisição ao backend)
      alert(`Dia fechado com sucesso!\n\nTotal de horas: ${total}`);
      
      // Desabilitar campos após fechar
      document.getElementById('almocoSaida').disabled = true;
      document.getElementById('almocoVolta').disabled = true;
      document.getElementById('saida').disabled = true;
      btnFecharDia.disabled = true;
      btnFecharDia.textContent = 'Dia Fechado';
    });
  }
}

// ===== CARREGAR HISTÓRICO =====
function carregarHistorico() {
  // Aqui você faria uma requisição ao backend para buscar o histórico
  // Por enquanto, usando dados vazios
  const historicoTableBody = document.getElementById('historicoTableBody');
  
  if (historicoTableBody) {
    historicoTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          Nenhum registro encontrado
        </td>
      </tr>
    `;
  }
}

// ===== BANCO DE HORAS =====
function inicializarBancoHoras() {
  // Aqui você faria uma requisição ao backend para buscar o banco de horas
  // Por enquanto, usando dados de exemplo
  // Em produção, isso viria do backend calculando as horas trabalhadas vs horas esperadas
  
  const bancoTotalHoras = document.getElementById('bancoTotalHoras');
  const bancoTotalHoras2 = document.getElementById('bancoTotalHoras2');
  const bancoStatus = document.getElementById('bancoStatus');
  const bancoStatus2 = document.getElementById('bancoStatus2');
  const bancoStatusBadge = document.getElementById('bancoStatusBadge');
  const bancoStatusBadge2 = document.getElementById('bancoStatusBadge2');
  const bancoDetalhes = document.getElementById('bancoDetalhes');
  const bancoDetalhes2 = document.getElementById('bancoDetalhes2');
  const bancoCards = document.querySelectorAll('.banco-horas-card');
  
  // Exemplo de dados (em produção, viria do backend)
  const horasTrabalhadas = 160; // Total de horas trabalhadas no mês
  const horasEsperadas = 160; // Total de horas esperadas (ex: 8h/dia * 20 dias)
  const totalBanco = horasTrabalhadas - horasEsperadas;
  
  // Atualizar valores
  const totalFormatado = totalBanco >= 0 ? `+${totalBanco}h` : `${totalBanco}h`;
  
  if (bancoTotalHoras) bancoTotalHoras.textContent = totalFormatado;
  if (bancoTotalHoras2) bancoTotalHoras2.textContent = totalFormatado;
  
  // Determinar status
  let status = 'em-dia';
  let statusTexto = 'Em dia';
  let statusCor = 'bg-secondary';
  let detalhes = '';
  
  if (totalBanco < -10) {
    // Está devendo mais de 10 horas
    status = 'devendo';
    statusTexto = 'Devendo horas';
    statusCor = 'bg-danger';
    detalhes = `Você está devendo ${Math.abs(totalBanco)} horas. Considere compensar horas extras.`;
  } else if (totalBanco < 0) {
    // Está devendo menos de 10 horas
    status = 'devendo';
    statusTexto = 'Devendo horas';
    statusCor = 'bg-warning';
    detalhes = `Você está devendo ${Math.abs(totalBanco)} horas.`;
  } else if (totalBanco > 40) {
    // Tem muitas horas acumuladas (mais de 40h)
    status = 'excesso';
    statusTexto = 'Muitas horas acumuladas';
    statusCor = 'bg-warning';
    detalhes = `Você tem ${totalBanco} horas acumuladas. Considere usar suas horas de banco.`;
  } else if (totalBanco > 0) {
    // Tem horas acumuladas mas dentro do normal
    status = 'em-dia';
    statusTexto = 'Horas acumuladas';
    statusCor = 'bg-success';
    detalhes = `Você tem ${totalBanco} horas acumuladas no banco.`;
  } else {
    // Está em dia
    status = 'em-dia';
    statusTexto = 'Em dia';
    statusCor = 'bg-success';
    detalhes = 'Suas horas estão equilibradas.';
  }
  
  // Atualizar badges
  if (bancoStatusBadge) {
    bancoStatusBadge.textContent = statusTexto;
    bancoStatusBadge.className = `badge ${statusCor}`;
  }
  if (bancoStatusBadge2) {
    bancoStatusBadge2.textContent = statusTexto;
    bancoStatusBadge2.className = `badge ${statusCor}`;
  }
  
  // Atualizar detalhes
  if (bancoDetalhes) bancoDetalhes.innerHTML = `<small class="text-muted">${detalhes}</small>`;
  if (bancoDetalhes2) bancoDetalhes2.innerHTML = `<small class="text-muted">${detalhes}</small>`;
  
  // Atualizar classes dos cards
  bancoCards.forEach(card => {
    card.className = 'ativ-card atividade banco-horas-card';
    card.classList.add(`status-${status}`);
  });
  
  console.log('Banco de horas inicializado:', {
    horasTrabalhadas,
    horasEsperadas,
    totalBanco,
    status
  });
}

// ===== NOTIFICAÇÕES =====
async function carregarNotificacoes() {
  const badgeNotificacoes = document.getElementById('badgeNotificacoes');
  const notificacoesLista = document.getElementById('notificacoesLista');
  
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  if (!usuarioSalvo || !notificacoesLista) return;
  
  try {
    const usuario = JSON.parse(usuarioSalvo);
    const response = await fetch(`http://localhost:3000/usuarios/${usuario.id}/notificacoes`);
    const notificacoes = response.ok ? await response.json() : [];
    
    if (badgeNotificacoes) {
      const naoLidas = notificacoes.filter(n => !n.lida).length;
      badgeNotificacoes.textContent = naoLidas;
      badgeNotificacoes.style.display = naoLidas > 0 ? 'inline-block' : 'none';
    }
    
    if (notificacoes.length === 0) {
      notificacoesLista.innerHTML = '<p class="text-muted text-center py-4">Nenhuma notificação no momento</p>';
    } else {
      notificacoesLista.innerHTML = notificacoes.map(n => {
        const dataFormatada = n.data_criacao 
          ? new Date(n.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
          : 'Agora';
        const iconBg = n.tipo === 'warning' ? '#f39c12' : n.tipo === 'danger' ? '#e74c3c' : '#3498db';
        return `
          <div class="notificacao-item" data-notificacao-id="${n.id}">
            <div class="notificacao-icon bg-dark" style="background: ${iconBg};">
              <i class="fas fa-${n.tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="notificacao-content">
              <h5>${n.titulo || 'Notificação'}</h5>
              <p class="text-muted mb-1">${n.mensagem || ''}</p>
              <small class="text-muted">${dataFormatada}</small>
            </div>
            <button class="btn btn-sm btn-outline-primary btnVerMensagem" data-notificacao-id="${n.id}" data-titulo="${(n.titulo || '').replace(/"/g, '&quot;')}" data-mensagem="${(n.mensagem || '').replace(/"/g, '&quot;')}" data-data="${dataFormatada}" data-tipo="${n.tipo || 'info'}" data-fixada="false">Ver</button>
          </div>
        `;
      }).join('');
    }
    
    inicializarModalMensagem();
    console.log('Notificações carregadas:', notificacoes.length);
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
    notificacoesLista.innerHTML = '<p class="text-muted text-center py-4">Nenhuma notificação no momento</p>';
    if (badgeNotificacoes) badgeNotificacoes.style.display = 'none';
    inicializarModalMensagem();
  }
}

function inicializarNotificacoes() {
  carregarNotificacoes();
}

// ===== MODAL DE MENSAGEM =====
let notificacaoAtual = null;

function inicializarModalMensagem() {
  // Event listeners para botões "Ver"
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
    modalIcon.style.background = '#3498db';
    icon.className = 'fas fa-info-circle';
  } else if (notificacao.tipo === 'warning') {
    modalIcon.style.background = '#f39c12';
    icon.className = 'fas fa-exclamation-triangle';
  } else if (notificacao.tipo === 'danger') {
    modalIcon.style.background = '#e74c3c';
    icon.className = 'fas fa-exclamation-circle';
  } else {
    modalIcon.style.background = '#3498db';
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
  const notifLembretes = document.getElementById('notifLembretes');
  
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
  
  if (notifLembretes) {
    notifLembretes.addEventListener('change', (e) => {
      localStorage.setItem('notifLembretes', e.target.checked);
    });
    
    // Carregar preferência salva
    const savedNotifLembretes = localStorage.getItem('notifLembretes');
    if (savedNotifLembretes !== null) {
      notifLembretes.checked = savedNotifLembretes === 'true';
    }
  }
  
  // Configurações de registro de horas
  const entradaAutomatica = document.getElementById('entradaAutomatica');
  const lembreteSaida = document.getElementById('lembreteSaida');
  
  if (entradaAutomatica) {
    entradaAutomatica.addEventListener('change', (e) => {
      localStorage.setItem('entradaAutomatica', e.target.checked);
    });
    
    const savedEntradaAutomatica = localStorage.getItem('entradaAutomatica');
    if (savedEntradaAutomatica !== null) {
      entradaAutomatica.checked = savedEntradaAutomatica === 'true';
    }
  }
  
  if (lembreteSaida) {
    lembreteSaida.addEventListener('change', (e) => {
      localStorage.setItem('lembreteSaida', e.target.checked);
    });
    
    const savedLembreteSaida = localStorage.getItem('lembreteSaida');
    if (savedLembreteSaida !== null) {
      lembreteSaida.checked = savedLembreteSaida === 'true';
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
    if (temaEscuro) temaEscuro.checked = true;
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
  
  // Botão exportar dados
  const btnExportar = document.querySelector('.btn-outline-secondary');
  if (btnExportar && btnExportar.textContent.includes('Exportar')) {
    btnExportar.addEventListener('click', () => {
      alert('Funcionalidade de exportar dados será implementada em breve.');
    });
  }
  
  // Botão excluir conta
  const btnExcluir = document.querySelector('.btn-outline-danger');
  if (btnExcluir && btnExcluir.textContent.includes('Excluir')) {
    btnExcluir.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        alert('Funcionalidade de excluir conta será implementada em breve.');
      }
    });
  }
  
  console.log('Configurações inicializadas');
}

// ===== FUNCIONALIDADE DE FOTO DE PERFIL =====
function carregarFotoPerfil(usuarioId) {
  // Tentar carregar foto do localStorage primeiro
  const fotoSalva = localStorage.getItem(`fotoPerfil_${usuarioId}`);
  const avatarImg = document.getElementById('profileAvatarImg');
  const avatarIcon = document.getElementById('profileAvatarIcon');
  
  if (fotoSalva) {
    avatarImg.src = fotoSalva;
    avatarImg.style.display = 'block';
    avatarIcon.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarIcon.style.display = 'block';
  }
}

function inicializarTrocaFoto() {
  const btnTrocarFoto = document.getElementById('btnTrocarFoto');
  const fotoInput = document.getElementById('fotoPerfilInput');
  const avatarContainer = document.getElementById('profileAvatarContainer');
  const avatarImg = document.getElementById('profileAvatarImg');
  const avatarIcon = document.getElementById('profileAvatarIcon');
  
  // Botão trocar foto
  if (btnTrocarFoto) {
    btnTrocarFoto.addEventListener('click', () => {
      fotoInput.click();
    });
  }
  
  // Clique na imagem/ícone também abre o seletor
  if (avatarContainer) {
    avatarContainer.addEventListener('click', () => {
      fotoInput.click();
    });
  }
  
  // Quando uma foto é selecionada
  if (fotoInput) {
    fotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione uma imagem válida.');
          return;
        }
        
        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB.');
          return;
        }
        
        // Ler arquivo como base64
        const reader = new FileReader();
        reader.onload = (event) => {
          const fotoBase64 = event.target.result;
          
          // Obter ID do usuário
          const usuarioSalvo = localStorage.getItem('usuarioLogado');
          if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            const usuarioId = usuario.id;
            
            // Salvar no localStorage
            localStorage.setItem(`fotoPerfil_${usuarioId}`, fotoBase64);
            
            // Atualizar exibição
            avatarImg.src = fotoBase64;
            avatarImg.style.display = 'block';
            avatarIcon.style.display = 'none';
            
            // Atualizar foto no sidebar também
            atualizarFotoSidebar(fotoBase64);
            
            // Aqui você pode fazer uma requisição ao backend para salvar a foto
            // Por enquanto, apenas salvamos no localStorage
            console.log('Foto de perfil atualizada');
            alert('Foto atualizada com sucesso!');
          }
        };
        reader.onerror = () => {
          alert('Erro ao ler a imagem. Tente novamente.');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function atualizarFotoSidebar(fotoBase64) {
  // Atualizar foto no sidebar se existir
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarAvatar) {
    let sidebarImg = sidebarAvatar.querySelector('img');
    if (!sidebarImg) {
      sidebarImg = document.createElement('img');
      sidebarImg.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #3498db;';
      const icon = sidebarAvatar.querySelector('i');
      if (icon) {
        icon.style.display = 'none';
      }
      sidebarAvatar.appendChild(sidebarImg);
    }
    sidebarImg.src = fotoBase64;
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando tela do colaborador...');
  
  // Verificar se há usuário logado
  const usuarioSalvo = localStorage.getItem('usuarioLogado');
  if (!usuarioSalvo) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = '/';
    return;
  }
  
  // Carregar dados do usuário
  carregarDadosUsuario();
  
  // Sincronizar dados do usuário ao carregar a página (para garantir dados atualizados)
  sincronizarDadosUsuario();
  
  // Inicializar troca de foto
  inicializarTrocaFoto();
  
  // Inicializar registro de horas
  inicializarRegistroHoras();
  
  // Inicializar navegação
  inicializarNavegacao();
  
  // Inicializar sair
  inicializarSair();
  
  // Inicializar fechar dia
  inicializarFecharDia();
  
  // Carregar histórico
  carregarHistorico();
  
  // Inicializar banco de horas
  inicializarBancoHoras();
  
  // Inicializar notificações
  inicializarNotificacoes();
  
  // Inicializar configurações
  inicializarConfiguracoes();
  
  // Atualizar sidebar inicialmente
  atualizarSidebar();
  
  // Atualizar sidebar periodicamente (a cada 5 segundos)
  setInterval(atualizarSidebar, 5000);
  
  // Sincronizar dados do usuário periodicamente (a cada 10 segundos)
  setInterval(sincronizarDadosUsuario, 10000);
  
  // Sincronizar dados quando a janela ganha foco (usuário volta para a aba)
  window.addEventListener('focus', () => {
    sincronizarDadosUsuario();
  });
  
  // Sincronizar dados quando a página fica visível novamente
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      sincronizarDadosUsuario();
    }
  });
  
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
  
  // Carregar projetos (apenas visualização)
  carregarProjetosColaborador();
  
  // Inicializar funcionalidades de suporte
  inicializarSuporte();
  
  console.log('Tela do colaborador inicializada com sucesso!');
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

// ===== CARREGAR PROJETOS (COLABORADOR - APENAS VISUALIZAÇÃO) =====
async function carregarProjetosColaborador() {
  const projetosGridInicial = document.getElementById('projetosGridColaborador');
  const projetosGridSecao = document.getElementById('projetosGridColaboradorSecao');
  
  const grids = [projetosGridInicial, projetosGridSecao].filter(el => el !== null);
  
  if (grids.length === 0) return;
  
  try {
    // Obter ID do colaborador do localStorage
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) {
      grids.forEach(grid => {
        grid.innerHTML = '<div class="col-12 text-center text-muted py-5"><p>Usuário não encontrado.</p></div>';
      });
      return;
    }
    
    const usuario = JSON.parse(usuarioSalvo);
    const colaboradorId = usuario.id;
    
    // Buscar apenas projetos atribuídos a este colaborador
    const response = await fetch(`http://localhost:3000/colaboradores/${colaboradorId}/projetos`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar projetos');
    }
    
    const projetos = await response.json();
    
    const htmlVazio = `
      <div class="col-12 text-center text-muted py-5">
        <i class="fas fa-folder-open fa-3x mb-3"></i>
        <p>Nenhum projeto atribuído a você no momento.</p>
        <small class="text-muted">Entre em contato com o líder para receber projetos.</small>
      </div>
    `;
    
    const htmlErro = `
      <div class="col-12 text-center text-danger py-5">
        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
        <p>Erro ao carregar projetos. Tente novamente mais tarde.</p>
      </div>
    `;
    
    if (projetos.length === 0) {
      grids.forEach(grid => {
        grid.innerHTML = htmlVazio;
      });
      return;
    }
    
    // Renderizar projetos (somente leitura)
    const htmlProjetos = projetos.map(projeto => {
      const dataInicio = projeto.data_inicio 
        ? new Date(projeto.data_inicio).toLocaleDateString('pt-BR')
        : 'Não definida';
      
      return `
        <div class="project-card">
          <h3>
            <i class="fas fa-folder me-2"></i>
            ${projeto.nome || 'Sem nome'}
          </h3>
          <p>
            <strong>Código:</strong>
            <span>${projeto.codigo || 'Não definido'}</span>
          </p>
          <p>
            <strong>Início:</strong>
            <span class="badge bg-secondary">${dataInicio}</span>
          </p>
        </div>
      `;
    }).join('');
    
    grids.forEach(grid => {
      grid.innerHTML = htmlProjetos;
    });
    
    console.log('Projetos carregados (colaborador):', projetos);
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    grids.forEach(grid => {
      grid.innerHTML = htmlErro;
    });
  }
}
