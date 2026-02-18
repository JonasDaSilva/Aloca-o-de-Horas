import { useState, useEffect } from 'react';
import './App.css'
import Formulario from "./formulario";
import Login from "./login";

function App() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAtual, setTelaAtual] = useState('login'); // 'login', 'formulario', 'colaborador', 'lider'

  // Monitorar mudanças no telaAtual
  useEffect(() => {
    console.log('=== Estado telaAtual mudou para:', telaAtual);
    console.log('=== usuarioLogado:', usuarioLogado);
  }, [telaAtual, usuarioLogado]);

  // Verificar se há usuário logado no localStorage ao carregar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      try {
        const usuario = JSON.parse(usuarioSalvo);
        console.log('Carregando usuário do localStorage:', usuario);
        setUsuarioLogado(usuario);
        // Não abrir aba automaticamente ao carregar a página, apenas manter o login
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('usuarioLogado');
      }
    }
  }, []);

  const handleLoginSuccess = (usuario) => {
    console.log('=== handleLoginSuccess chamado ===');
    console.log('Usuário recebido:', usuario);
    console.log('Perfil do usuário:', usuario?.perfil);
    
    setUsuarioLogado(usuario);
    // Salvar dados do usuário no localStorage
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    
    // Abrir nova aba baseado no perfil
    const perfil = usuario?.perfil;
    const baseUrl = window.location.origin;
    
    if (perfil === 'colaborador') {
      console.log('>>> Abrindo nova aba para colaborador <<<');
      window.open(`${baseUrl}/colaborador/colaborador.html`, '_blank');
    } else if (perfil === 'lider') {
      console.log('>>> Abrindo nova aba para líder <<<');
      window.open(`${baseUrl}/lider/lider.html`, '_blank');
    } else {
      console.warn('>>> Perfil desconhecido ou não encontrado:', perfil);
    }
  };

  // Escutar mensagens do iframe de login
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'loginSuccess') {
        handleLoginSuccess(event.data.usuario);
      } else if (event.data.type === 'mostrarFormulario') {
        setMostrarFormulario(true);
        setTelaAtual('formulario');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Se não estiver logado, mostrar tela de login
  if (telaAtual === 'login' || telaAtual === 'formulario') {
    if (mostrarFormulario) {
      return <Formulario onVoltar={() => {
        setMostrarFormulario(false);
        setTelaAtual('login');
      }} />;
    }
    
    // Usar componente React de login
    return (
      <Login 
        onCadastrar={() => {
          setMostrarFormulario(true);
          setTelaAtual('formulario');
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return null;
}

export default App

