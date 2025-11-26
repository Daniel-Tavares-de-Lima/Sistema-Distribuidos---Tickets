const paginationMiddleware = (req, res, next) => {
    let {page, limit} = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    //---Validações
    if (page < 1){
        page = 1;
    }
    if(limit < 0){
        limit = 10;
    }
    if(limit > 100){
        limit = 100;
    }

    //--Passando para o req para os controllers usarem
    req.pagination = {page, limit}

    next()

}

module.exports = paginationMiddleware;