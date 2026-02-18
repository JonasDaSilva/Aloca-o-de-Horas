import { useState, useEffect } from "react";

function Login({ onCadastrar, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [lembrarSenha, setLembrarSenha] = useState(false);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const emailSalvo = localStorage.getItem("lembrarEmail");
    const senhaSalva = localStorage.getItem("lembrarSenha");
    const lembrarAtivado = localStorage.getItem("lembrarSenhaAtivado") === "true";

    if (lembrarAtivado && emailSalvo && senhaSalva) {
      setEmail(emailSalvo);
      setSenha(senhaSalva);
      setLembrarSenha(true);
    }
  }, []);

  // Mostrar alert quando houver erro
  useEffect(() => {
    if (erro) {
      alert(erro);
      setErro("");
    }
  }, [erro]);

  const fazerLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      console.log("Fazendo requisição para: http://localhost:3000/login");
      console.log("Dados enviados:", { email, senha: "***" });
      
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      console.log("Status da resposta:", response.status);
      console.log("Status text:", response.statusText);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      let data;
      try {
        const text = await response.text();
        console.log("Resposta do servidor (texto):", text);
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error("Erro ao fazer parse do JSON:", jsonError);
        throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}. Resposta: ${await response.text()}`);
      }

      if (!response.ok) {
        console.error("Resposta não OK. Status:", response.status);
        console.error("Dados da resposta:", data);
        throw new Error(data.erro || `Erro ao fazer login: ${response.status} - ${response.statusText}`);
      }

      console.log("Login realizado - resposta completa:", data);
      console.log("Perfil do usuário:", data.usuario?.perfil);
      console.log("Dados do usuário:", JSON.stringify(data.usuario, null, 2));
      
      // Salvar credenciais se "lembrar senha" estiver marcado
      if (lembrarSenha) {
        localStorage.setItem("lembrarEmail", email);
        localStorage.setItem("lembrarSenha", senha);
        localStorage.setItem("lembrarSenhaAtivado", "true");
      } else {
        // Remover credenciais salvas se desmarcado
        localStorage.removeItem("lembrarEmail");
        localStorage.removeItem("lembrarSenha");
        localStorage.removeItem("lembrarSenhaAtivado");
      }
      
      // Chamar callback de sucesso com os dados do usuário
      if (onLoginSuccess && data.usuario) {
        console.log("Chamando onLoginSuccess com:", data.usuario);
        console.log("Perfil que será usado:", data.usuario.perfil);
        onLoginSuccess(data.usuario);
      } else {
        console.error("onLoginSuccess não disponível ou usuário não encontrado");
        console.error("onLoginSuccess existe?", !!onLoginSuccess);
        console.error("data.usuario existe?", !!data.usuario);
        console.error("data completo:", data);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErro(error.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastrarClick = (e) => {
    e.preventDefault();
    if (onCadastrar) {
      onCadastrar();
    }
  };

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  return (
    <main className="container">
      <form onSubmit={fazerLogin}>
        <h1>Registro de Horas</h1>

        <div className="input-group">  
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="bx bxs-user"></i>
        </div>

        <div className="input-group">
          <input
            placeholder="Senha"
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ paddingRight: "80px" }}
          />
          <i className="bx bxs-lock-alt"></i>
          <button
            type="button"
            onClick={toggleMostrarSenha}
            style={{
              position: "absolute",
              right: "45px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "18px",
              padding: "5px",
              zIndex: 2
            }}
          >
            {mostrarSenha ? (
              <i className="bx bx-hide"></i>
            ) : (
              <i className="bx bx-show"></i>
            )}
          </button>
        </div>

        <div className="remember-forgot">
          <label className="remember-label">
            <input 
              type="checkbox" 
              checked={lembrarSenha}
              onChange={(e) => setLembrarSenha(e.target.checked)}
              className="remember-checkbox"
            />
            <span className="remember-text">
              <span className="custom-checkbox">
                {lembrarSenha && <i className="bx bx-check"></i>}
              </span>
              Lembrar senha
            </span>
          </label>
          <a href="#">Esqueci senha</a>
        </div>

        <button type="submit" className="login" disabled={carregando}>
          {carregando ? "Entrando..." : "Login"}
        </button>

        <div className="register-link">
          <p>Não tem uma conta?</p> <a href="#" onClick={handleCadastrarClick}>Cadastre-se</a>
        </div>
      </form>
    </main>
  );
}

export default Login;
