const express = require('express')
const app = express()

const bodyParser = require('body-parser')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async(request, response) => {
    //console.log(new Date())
    //response.send('Olá fullstack lab.')

    const db = await dbConnection
    const categoriasDb = await db.all('SELECT * FROM categorias;')
    const vagas = await db.all('SELECT * FROM vagas;')

    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })

    response.render('home', {
        categorias
    })
})
app.get('/vaga/:id', async(request, response) => {
    console.log(new Date())
    //response.send('Olá fullstack lab.')

    const db = await dbConnection
    const vaga = await db.get('SELECT * FROM vagas WHERE id = '+request.params.id)

    response.render('vaga', {
        vaga
    })
})
app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('DELETE FROM vagas WHERE id = '+req.params.id+'')
    res.redirect('/admin/vagas')
})
app.get('/admin/vagas/nova', async(req, res) => {
    res.render('admin/nova-vaga')
})
app.post('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection

    const { titulo, descricao, categoria } = req.body
    await db.run(`INSERT INTO vagas (categoria,titulo,descricao) values ('${categoria}', '${titulo}', '${descricao}')`)

    res.redirect('/admin/vagas')
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('SELECT * FROM vagas;')

    res.render('admin/vagas', { vagas })
})

const init = async() => {
    const db = await dbConnection
    await db.run('CREATE TABLE IF NOT EXISTS categorias ( id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('CREATE TABLE IF NOT EXISTS vagas ( id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT );')
    //const categoria = 'Marketing team'
    //await db.run(`INSERT INTO categorias (categoria) values ('${categoria}')`)
    //const vaga = 'Social Media digital (San Francisco)'
    //const descricao = 'Vaga para fullstack developer que fez o fullstack lab'
    //await db.run(`INSERT INTO vagas (categoria,titulo,descricao) values (2, '${vaga}', '${descricao}')`)
}

init()

app.listen(3000, (err) => {
    if(err){
        console.log('Não foi possível iniciar o servidro do jobify.')
    }else{
        console.log('Servidor do jobify rodando...')
    }
})