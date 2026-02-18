import { useState } from "react";
import "./formulario.css";

function Formulario({ onVoltar }) {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    emailConfirmation: "",
    idade: "",
    sexo: "",
    password: "",
    passwordConfirmation: "",
    perfil: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Nome completo é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.emailConfirmation.trim()) {
      newErrors.emailConfirmation = "Confirmação de e-mail é obrigatória";
    } else if (formData.email !== formData.emailConfirmation) {
      newErrors.emailConfirmation = "Os e-mails não coincidem";
    }

    if (!formData.idade) {
      newErrors.idade = "Idade é obrigatória";
    } else {
      const idadeNum = parseInt(formData.idade);
      if (isNaN(idadeNum) || idadeNum < 18 || idadeNum > 120) {
        newErrors.idade = "Idade deve ser entre 18 e 120 anos";
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = "Selecione o sexo";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(formData.password)) {
      newErrors.password = "A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas e números";
    }

    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "As senhas não coincidem";
    }

    if (!formData.perfil) {
      newErrors.perfil = "Selecione um perfil";
    }

    if (!formData.terms) {
      newErrors.terms = "Você deve aceitar os termos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.fullname,
          email: formData.email,
          idade: parseInt(formData.idade),
          sexo: formData.sexo,
          senha: formData.password,
          perfil: formData.perfil,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.erro || `Erro ao cadastrar usuário: ${response.status}`);
      }

      console.log("Usuário cadastrado:", data);
      alert("Usuário cadastrado com sucesso!");
      
      // Limpar formulário
      setFormData({
        fullname: "",
        email: "",
        emailConfirmation: "",
        idade: "",
        sexo: "",
        password: "",
        passwordConfirmation: "",
        perfil: "",
        terms: false,
      });
      setErrors({});
      
      // Voltar para a tela de login após cadastro bem-sucedido
      if (onVoltar) {
        setTimeout(() => {
          onVoltar();
        }, 500); // Pequeno delay para o usuário ver a mensagem de sucesso
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert(error.message || "Erro ao cadastrar usuário. Tente novamente.");
    }
  };

  return (
    <div className="formulario-container">
      <div className="container">
        <section className="header">
          <h2>Nova conta</h2>
        </section>

        <form id="form" className="form" onSubmit={handleSubmit}>
          <div className={`form_content ${errors.fullname ? "error" : ""}`}>
            <label htmlFor="fullname">Nome Completo</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Digite seu nome completo"
              value={formData.fullname}
              onChange={handleChange}
            />
            {errors.fullname && <small>{errors.fullname}</small>}
          </div>

          <div className={`form_content ${errors.email ? "error" : ""}`}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Digite o seu email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <small>{errors.email}</small>}
          </div>

          <div
            className={`form_content ${
              errors.emailConfirmation
                ? "error"
                : formData.emailConfirmation &&
                  formData.email === formData.emailConfirmation &&
                  /\S+@\S+\.\S+/.test(formData.email)
                ? "success"
                : ""
            }`}
          >
            <label htmlFor="email-confirmation">Confirmação de e-mail</label>
            <input
              type="email"
              id="email-confirmation"
              name="emailConfirmation"
              placeholder="Digite o email novamente"
              value={formData.emailConfirmation}
              onChange={handleChange}
            />
            {errors.emailConfirmation ? (
              <small>{errors.emailConfirmation}</small>
            ) : formData.emailConfirmation &&
              formData.email === formData.emailConfirmation &&
              /\S+@\S+\.\S+/.test(formData.email) ? (
              <small>Os e-mails coincidem</small>
            ) : (
              <small></small>
            )}
          </div>

          <div className={`form_content ${errors.idade ? "error" : ""}`}>
            <label htmlFor="idade">Idade</label>
            <input
              type="number"
              id="idade"
              name="idade"
              placeholder="Digite sua idade"
              value={formData.idade}
              onChange={handleChange}
              min="18"
              max="120"
            />
            {errors.idade && <small>{errors.idade}</small>}
          </div>

          <div className={`form_content ${errors.sexo ? "error" : ""}`}>
            <label htmlFor="sexo">Sexo</label>
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
            >
              <option value="">Selecione o sexo</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="prefiro-nao-informar">Prefiro não informar</option>
            </select>
            {errors.sexo && <small>{errors.sexo}</small>}
          </div>

          <div className={`form_content ${errors.password ? "error" : ""}`}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Digite a sua senha"
              value={formData.password}
              onChange={handleChange}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúsculas e números"
            />
            <small>
              {errors.password
                ? errors.password
                : "Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números"}
            </small>
          </div>

          <div
            className={`form_content ${
              errors.passwordConfirmation ? "error" : ""
            }`}
          >
            <label htmlFor="password-confirmation">Confirmação de senha</label>
            <input
              type="password"
              id="password-confirmation"
              name="passwordConfirmation"
              placeholder="Digite a senha novamente"
              value={formData.passwordConfirmation}
              onChange={handleChange}
            />
            {errors.passwordConfirmation && (
              <small>{errors.passwordConfirmation}</small>
            )}
          </div>

          <div className={`form_content ${errors.terms ? "error" : ""}`}>
            <label className="terms-label" htmlFor="terms">
              Aceito os termos de uso e a política de privacidade
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
            </label>
            {errors.terms && <small>{errors.terms}</small>}
          </div>

          <fieldset className="perfil">
            <legend>Você é:</legend>

            <label>
              <input
                type="radio"
                name="perfil"
                value="colaborador"
                checked={formData.perfil === "colaborador"}
                onChange={handleChange}
              />
              Colaborador
            </label>

            <label>
              <input
                type="radio"
                name="perfil"
                value="lider"
                checked={formData.perfil === "lider"}
                onChange={handleChange}
              />
              Líder de empresa
            </label>
            {errors.perfil && <small style={{ color: "#e74c3c", display: "block", marginTop: "8px" }}>{errors.perfil}</small>}
          </fieldset>

          <button type="submit">Cadastrar</button>
          
          {onVoltar && (
            <button
              type="button"
              onClick={onVoltar}
              style={{
                marginTop: "10px",
                padding: "12px",
                fontSize: "16px",
                backgroundColor: "#666",
              }}
            >
              Voltar para Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Formulario;
