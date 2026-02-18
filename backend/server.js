import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express()
app.use(express.json())
app.use(cors());

const db = await open({
  filename: './banco.db',
  driver: sqlite3.Database
})

app.get("/", (req, res) => {
  res.json({ mensagem: "Servidor funcionando 🚀" });
});

// Criar ou atualizar tabela de usuários
try {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT,
      perfil TEXT,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Verificar se as colunas existem e adicionar se não existirem
  const tableInfo = await db.all("PRAGMA table_info(usuarios)")
  const columns = tableInfo.map(col => col.name)
  
  if (!columns.includes('senha')) {
    await db.exec('ALTER TABLE usuarios ADD COLUMN senha TEXT')
  }
  
  if (!columns.includes('perfil')) {
    await db.exec('ALTER TABLE usuarios ADD COLUMN perfil TEXT')
  }
  
  if (!columns.includes('data_cadastro')) {
    await db.exec('ALTER TABLE usuarios ADD COLUMN data_cadastro DATETIME')
  }
  
  if (!columns.includes('funcao')) {
    await db.exec('ALTER TABLE usuarios ADD COLUMN funcao TEXT')
  }
  
  if (!columns.includes('nome_empresa')) {
    await db.exec('ALTER TABLE usuarios ADD COLUMN nome_empresa TEXT')
  }
  
  if (!columns.includes('cnpj')) {
    await db.exec('ALTER TABLE usuarios ADD COLUMN cnpj TEXT')
  }
  
  console.log('Tabela de usuários verificada/atualizada com sucesso')
} catch (error) {
  console.error('Erro ao criar/atualizar tabela:', error)
}

// Criar tabela de projetos
try {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projetos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      codigo TEXT,
      data_inicio TEXT,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY (criado_por) REFERENCES usuarios(id)
    )
  `)
  console.log('Tabela de projetos criada/verificada com sucesso')
} catch (error) {
  console.error('Erro ao criar tabela de projetos:', error)
}

// Criar tabela de associação projeto-colaborador
try {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projeto_colaborador (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projeto_id INTEGER NOT NULL,
      colaborador_id INTEGER NOT NULL,
      data_atribuicao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
      FOREIGN KEY (colaborador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      UNIQUE(projeto_id, colaborador_id)
    )
  `)
  console.log('Tabela projeto_colaborador criada/verificada com sucesso')
} catch (error) {
  console.error('Erro ao criar tabela projeto_colaborador:', error)
}

// Criar tabela de notificações
try {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notificacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destinatario_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      mensagem TEXT,
      tipo TEXT DEFAULT 'info',
      lida INTEGER DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `)
  console.log('Tabela notificacoes criada/verificada com sucesso')
} catch (error) {
  console.error('Erro ao criar tabela notificacoes:', error)
}

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, perfil, funcao } = req.body

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos' })
    }

    // Verificar se o email já existe
    const usuarioExistente = await db.get(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    )

    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Este email já está cadastrado' })
    }

    await db.run(
      'INSERT INTO usuarios (nome, email, senha, perfil, funcao) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senha, perfil, funcao || null]
    )

    res.json({ mensagem: 'Usuário cadastrado com sucesso!' })

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error)
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ erro: 'Este email já está cadastrado' })
    }
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

app.post('/login', async (req, res) => {
  console.log('=== ROTA /login ACESSADA ===');
  console.log('Método:', req.method);
  console.log('Path:', req.path);
  console.log('Body recebido:', { email: req.body?.email, senha: req.body?.senha ? '***' : undefined });
  console.log('Headers:', req.headers);
  
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      console.log('Erro: Email ou senha não fornecidos');
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' })
    }

    const usuario = await db.get(
      'SELECT id, nome, email, senha, perfil, funcao, nome_empresa, cnpj, data_cadastro FROM usuarios WHERE email = ?',
      [email]
    )

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' })
    }

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' })
    }

    // Retornar dados do usuário sem a senha
    const { senha: _, ...usuarioSemSenha } = usuario
    console.log('Login bem-sucedido para:', usuario.email, 'Perfil:', usuario.perfil)
    res.json({ 
      mensagem: 'Login realizado com sucesso',
      usuario: usuarioSemSenha
    })

  } catch (error) {
    console.error('Erro ao fazer login:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Middleware de log para debug
app.use((req, res, next) => {
  if (req.path.startsWith('/usuarios')) {
    console.log(`[${req.method}] ${req.path} - Params:`, req.params, 'Query:', req.query);
  }
  next();
});

app.get('/usuarios', async (req, res) => {
  try {
    const { nome } = req.query

    let usuarios

    if (nome) {
      usuarios = await db.all(
        'SELECT * FROM usuarios WHERE LOWER(nome) LIKE LOWER(?)',
        [`%${nome}%`]
      )
    } else {
      usuarios = await db.all('SELECT * FROM usuarios')
    }

    res.json(usuarios)

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// IMPORTANTE: Rotas mais específicas devem vir ANTES das genéricas
// Buscar notificações de um usuário (mais específica)
app.get('/usuarios/:id/notificacoes', async (req, res) => {
  try {
    const { id } = req.params

    const notificacoes = await db.all(
      'SELECT * FROM notificacoes WHERE destinatario_id = ? ORDER BY data_criacao DESC',
      [id]
    )

    res.json(notificacoes)

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Buscar usuário por ID (rota genérica - deve vir depois das específicas)
app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    console.log(`[GET /usuarios/:id] Buscando usuário com ID: ${id}`)

    const usuario = await db.get(
      'SELECT id, nome, email, perfil, funcao, nome_empresa, cnpj, data_cadastro FROM usuarios WHERE id = ?',
      [id]
    )

    console.log(`[GET /usuarios/:id] Usuário encontrado:`, usuario ? 'Sim' : 'Não')

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }

    res.json(usuario)

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nome, email, funcao, nome_empresa, cnpj } = req.body

    // Verificar se o usuário existe
    const usuarioExistente = await db.get(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    )

    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }

    // Verificar se o email já está sendo usado por outro usuário
    if (email) {
      const emailEmUso = await db.get(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      )

      if (emailEmUso) {
        return res.status(400).json({ erro: 'Este email já está cadastrado para outro usuário' })
      }
    }

    // Construir query de atualização dinamicamente
    const campos = []
    const valores = []

    if (nome !== undefined) {
      campos.push('nome = ?')
      valores.push(nome)
    }
    if (email !== undefined) {
      campos.push('email = ?')
      valores.push(email)
    }
    if (funcao !== undefined) {
      campos.push('funcao = ?')
      valores.push(funcao)
    }
    if (nome_empresa !== undefined) {
      campos.push('nome_empresa = ?')
      valores.push(nome_empresa)
    }
    if (cnpj !== undefined) {
      campos.push('cnpj = ?')
      valores.push(cnpj)
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' })
    }

    valores.push(id)

    await db.run(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      valores
    )

    // Buscar usuário atualizado
    const usuarioAtualizado = await db.get(
      'SELECT id, nome, email, perfil, funcao, nome_empresa, cnpj, data_cadastro FROM usuarios WHERE id = ?',
      [id]
    )

    res.json({ 
      mensagem: 'Usuário atualizado com sucesso',
      usuario: usuarioAtualizado
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params

    const resultado = await db.run(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    )

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// ===== ROTAS DE NOTIFICAÇÕES =====

app.post('/notificacoes', async (req, res) => {
  try {
    const { destinatario_id, titulo, mensagem, tipo } = req.body

    if (!destinatario_id || !titulo) {
      return res.status(400).json({ erro: 'Destinatário e título são obrigatórios' })
    }

    await db.run(
      'INSERT INTO notificacoes (destinatario_id, titulo, mensagem, tipo) VALUES (?, ?, ?, ?)',
      [destinatario_id, titulo, mensagem || '', tipo || 'info']
    )

    res.status(201).json({ mensagem: 'Notificação criada com sucesso' })

  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// ===== ROTAS DE PROJETOS =====

// Listar todos os projetos
app.get('/projetos', async (req, res) => {
  try {
    const projetos = await db.all('SELECT * FROM projetos ORDER BY data_criacao DESC')
    res.json(projetos)
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Criar novo projeto
app.post('/projetos', async (req, res) => {
  try {
    const { nome, codigo, data_inicio, criado_por } = req.body

    if (!nome) {
      return res.status(400).json({ erro: 'Nome do projeto é obrigatório' })
    }

    const resultado = await db.run(
      'INSERT INTO projetos (nome, codigo, data_inicio, criado_por) VALUES (?, ?, ?, ?)',
      [nome, codigo || null, data_inicio || null, criado_por || null]
    )

    const projetoCriado = await db.get('SELECT * FROM projetos WHERE id = ?', [resultado.lastID])

    res.status(201).json({ 
      mensagem: 'Projeto criado com sucesso',
      projeto: projetoCriado
    })

  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Atualizar projeto
app.put('/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nome, codigo, data_inicio } = req.body

    // Verificar se o projeto existe
    const projetoExistente = await db.get('SELECT id FROM projetos WHERE id = ?', [id])

    if (!projetoExistente) {
      return res.status(404).json({ erro: 'Projeto não encontrado' })
    }

    // Construir query de atualização dinamicamente
    const campos = []
    const valores = []

    if (nome !== undefined) {
      campos.push('nome = ?')
      valores.push(nome)
    }
    if (codigo !== undefined) {
      campos.push('codigo = ?')
      valores.push(codigo)
    }
    if (data_inicio !== undefined) {
      campos.push('data_inicio = ?')
      valores.push(data_inicio)
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' })
    }

    valores.push(id)

    await db.run(
      `UPDATE projetos SET ${campos.join(', ')} WHERE id = ?`,
      valores
    )

    const projetoAtualizado = await db.get('SELECT * FROM projetos WHERE id = ?', [id])

    res.json({ 
      mensagem: 'Projeto atualizado com sucesso',
      projeto: projetoAtualizado
    })

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Deletar projeto
app.delete('/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params

    const resultado = await db.run('DELETE FROM projetos WHERE id = ?', [id])

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Projeto não encontrado' })
    }

    res.json({ mensagem: 'Projeto deletado com sucesso' })

  } catch (error) {
    console.error('Erro ao deletar projeto:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// ===== ROTAS DE ASSOCIAÇÃO PROJETO-COLABORADOR =====

// Atribuir projeto a colaborador
app.post('/projetos/:projetoId/colaboradores/:colaboradorId', async (req, res) => {
  try {
    const { projetoId, colaboradorId } = req.params

    // Verificar se projeto existe
    const projeto = await db.get('SELECT id FROM projetos WHERE id = ?', [projetoId])
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' })
    }

    // Verificar se colaborador existe e é colaborador
    const colaborador = await db.get('SELECT id, perfil FROM usuarios WHERE id = ?', [colaboradorId])
    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado' })
    }
    if (colaborador.perfil !== 'colaborador') {
      return res.status(400).json({ erro: 'Usuário não é um colaborador' })
    }

    // Verificar se já está atribuído
    const existente = await db.get(
      'SELECT id FROM projeto_colaborador WHERE projeto_id = ? AND colaborador_id = ?',
      [projetoId, colaboradorId]
    )

    if (existente) {
      return res.status(400).json({ erro: 'Projeto já está atribuído a este colaborador' })
    }

    await db.run(
      'INSERT INTO projeto_colaborador (projeto_id, colaborador_id) VALUES (?, ?)',
      [projetoId, colaboradorId]
    )

    res.json({ mensagem: 'Projeto atribuído ao colaborador com sucesso' })

  } catch (error) {
    console.error('Erro ao atribuir projeto:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Remover projeto de colaborador
app.delete('/projetos/:projetoId/colaboradores/:colaboradorId', async (req, res) => {
  try {
    const { projetoId, colaboradorId } = req.params

    const resultado = await db.run(
      'DELETE FROM projeto_colaborador WHERE projeto_id = ? AND colaborador_id = ?',
      [projetoId, colaboradorId]
    )

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Associação não encontrada' })
    }

    res.json({ mensagem: 'Projeto removido do colaborador com sucesso' })

  } catch (error) {
    console.error('Erro ao remover projeto:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Listar projetos de um colaborador
app.get('/colaboradores/:colaboradorId/projetos', async (req, res) => {
  try {
    const { colaboradorId } = req.params

    const projetos = await db.all(`
      SELECT p.* 
      FROM projetos p
      INNER JOIN projeto_colaborador pc ON p.id = pc.projeto_id
      WHERE pc.colaborador_id = ?
      ORDER BY p.data_criacao DESC
    `, [colaboradorId])

    res.json(projetos)

  } catch (error) {
    console.error('Erro ao buscar projetos do colaborador:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Listar colaboradores de um projeto
app.get('/projetos/:projetoId/colaboradores', async (req, res) => {
  try {
    const { projetoId } = req.params

    const colaboradores = await db.all(`
      SELECT u.id, u.nome, u.email, u.funcao, pc.data_atribuicao
      FROM usuarios u
      INNER JOIN projeto_colaborador pc ON u.id = pc.colaborador_id
      WHERE pc.projeto_id = ?
      ORDER BY u.nome
    `, [projetoId])

    res.json(colaboradores)

  } catch (error) {
    console.error('Erro ao buscar colaboradores do projeto:', error)
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Rota para lidar com rotas não encontradas
app.use((req, res) => {
  // Log da requisição para debug
  console.log(`[404] Rota não encontrada: ${req.method} ${req.path}`);
  console.log(`[404] Query params:`, req.query);
  console.log(`[404] Route params:`, req.params);
  
  // Se a requisição for para arquivos HTML estáticos ou CSS/JS, não retornar erro JSON
  if (req.path.endsWith('.html') || req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.includes('/colaborador/') || req.path.includes('/lider/') || req.path.includes('/login/')) {
    return res.status(404).send(`
      <html>
        <head><title>Arquivo não encontrado</title></head>
        <body>
          <h1>404 - Arquivo não encontrado</h1>
          <p>O arquivo ${req.path} não foi encontrado no backend.</p>
          <p>Este é um arquivo estático que deve ser servido pelo frontend (Vite).</p>
          <p>Certifique-se de que o servidor frontend está rodando na porta padrão do Vite.</p>
          <p><strong>Dica:</strong> Acesse a aplicação através do servidor frontend, não do backend.</p>
        </body>
      </html>
    `)
  }
  
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    rota: req.path,
    metodo: req.method,
    rotasDisponiveis: {
      GET: ['/', '/usuarios', '/usuarios/:id', '/usuarios/:id/notificacoes', '/projetos', '/projetos/:id/colaboradores', '/colaboradores/:id/projetos'],
      POST: ['/usuarios', '/login', '/notificacoes', '/projetos', '/projetos/:id/colaboradores/:colaboradorId'],
      PUT: ['/usuarios/:id', '/projetos/:id'],
      DELETE: ['/usuarios/:id', '/projetos/:id', '/projetos/:id/colaboradores/:colaboradorId']
    }
  })
})

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})
