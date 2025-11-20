const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
// Importa as rotas
const userRoutes = require('./app/routes/userRoutes'); 
const formRoutes = require("./app/routes/FormRoutes")
// const ticketRoutes = require('./app/routes/ticketRoutes');
const authRoutes = require('./app/routes/authRoutes');
// const formResponseRoutes = require('./app/routes/formResponseRoutes');
// const { success } = require("./utils/responseFormatter");

app.use(cors()); //--Requisições de outros grupos
app.use(express.json()); //--Para interpretar JSON
app.use(express.urlencoded({extended: true})); //--Dados do formulário


//--Rota para teste
app.get("/", (req, res) => {
    res.json({
        message: "API DE Chamados - QSM",
        version: "1.0",
        status: "Online!"
    });
})

//--- Outras rotas -- EM ANDAMENTO
app.use('/api', userRoutes);
app.use('/api', formRoutes);
app.use('/api', authRoutes);
// app.use('/api', userRoutes);
// app.use('/api', ticketRoutes);
// app.use('/api', formResponseRoutes);
// app.use("/users", userRouter);
// app.user("/tickets", ticketsRouter)

//--Rota para erros
app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada",
        path: req.originalUrl
    });
})

//--Middlewares para tratamento de erros
app.use((err, req, res, next) =>{
    console.error("Erro: ", err);

    const statusCode = Number.isInteger(err.status) ? err.status : 500;
    res.status(err.statusCode).json({
        success: false,
        error: err.message
    });
})

module.exports = app;