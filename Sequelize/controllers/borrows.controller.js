const { response } = require("../routes/book.routes")

/*load model for `borrow  table`*/
const borrowModel = require(`../models/index`).borrow

/**load model for `detail_of_borrow` table */
const detailsOfBorrowModel = require(`../models/index`).details_of_borrow

/**load operator from sequelize */
const Op = require(`sequelize`).Op

/**create function for add book borrowing */
exports.addBorrowing = async (request, response) => {
    let newData = {
        memberID: request.body.memberID,
        adminID: request.body.adminID,
        date_of_borrow: request.body.date_of_borrow,
        date_of_return: request.body.date_of_return,
        status: request.body.status
    }
    borrowModel.create(newData)
        .then(result => {
            let borrowID = result.id
            let detailsOfBorrow = request.body.details_of_borrow

            for (let i = 0; i < detailsOfBorrow.length; i++) {
                detailsOfBorrow[i].borrowID = borrowID
            }

            detailsOfBorrowModel.bulkCreate(detailsOfBorrow)
                .then(result => {
                    return response.json({
                        success: true,
                        message: `New book borrowed has been inserted`
                    })
                })
                .catch(error => {
                    return response.json({
                        success: false,
                        message: error.message
                    })
                })
        })
        .catch(error => {
            return response.json({
                success: false,
                message: error.message
            })
        })
}


/**create function for update book borrowing */
exports.updateBorrowing = async (request, respose) => {
    /**prepare data for borrow's table */
    let newData = {
        memberID: request.body.memberID,
        adminID: request.body.adminID,
        date_of_borrow: request.body.date_of_borrow,
        date_of_return: request.body.date_of_return,
        status: request.body.status
    }

    /**prepare parameter borrow id */
    let borrowID = request.params.id

    /**execute for inserting to borrow's table */
    borrowModel.update(newData, { where: { id: borrowID } })
        .then(async result => {

            /**delete all detailsOfBorrow based on borrowID */
            await detailsOfBorrowModel.destroy(
                { where: { borrowID: borrowID } }
            )

            /**store details of book borrowing from request (typr: array object) */
            let detailsOfBorrow = request.body.detail_of_borrow

            /**insert borrowID to each item of  detailOfBorrow */
            for (let i = 0; i < detailsOfBorrow.length; i++) {
                detailsOfBorrow[i].borrowID = borrowID
            }

            /**re-insert all data of detailOfBorrow */
            detailsOfBorrowModel.bulkCreate(detailsOfBorrow)
                .then(result => {
                    return response.json({
                        success: true,
                        massage: 'Book Borrowed has been update'
                    })
                })
                .catch(error => {
                    return response.json({
                        success: false,
                        massage: error.massage
                    })
                })
        })
}

/**create function for delete book borrowing's data */
exports.deleteBorrowing = async (request, response) => {
    /**prepare borrowID that as parameter to delete */
    let borrowID = request.params.id

    /**delete detailsOfBorrow using model */
    detailsOfBorrowModel.destroy(
        { where: { borrowID: borrowID } }
    )
        .then(result => {
            /**delete borrow's data using model */
            borrowModel.destroy({ where: { id: borrowID } })
                .then(result => {
                    return response.json({
                        success: true,
                        massage: 'Borrowing Book`s has deteled'
                    })
                })
                .catch(error => {
                    return response.json({
                        success: false,
                        massage: error.massage
                    })
                })
        })
        .catch(error => {
            return response.json({
                success: false,
                massage: error.massage
            })
        })
}

/**create function for return borrowed book */
exports.returnBook = async (request, response) => {
    /**prepare borrowID that will be return */
    let borrowID = request.params.id

    /**prepare current time for return's time */
    let today = new Date()
    let currentDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    /**update status and date_of_return from borrow's data */
    borrowModel.update(
        {
            date_of_return: currentDate,
            status: true
        },
        {
            where: { id: borrowID }
        }
    )
        .then(result => {
            return response.json({
                success: true,
                massage: `Book has been returned`
            })
        })
        .catch(error => {
            return response.json({
                success: false,
                massage: error.massage
            })
        })
}

/**create function for get all borrowing data */
exports.getBorrow = async (request, response) => {
    let data = await borrowModel.findAll(
        {
            include: [
                `member`, `admin`,
                {
                    model: detailsOfBorrowModel,
                    as: `details_of_borrow`,
                    include: ["book"]
                }
            ]
        }
    )
    return response.json({
        success: true,
        data: data,
        massage: `All borrowing book have been loaded`
    })
}

exports.findBorrow = async (request, response) => {
    let keyword = request.body.keyword
    let data = await borrowModel.findAll(
        {
            include: [
                `admin`,
                {
                    model: memberModel,
                    as: `member`,
                    where: {
                        [Op.or]: [
                            { name: { [Op.substring]: keyword } }
                        ]
                    }
                },
                {
                    model: detailsOfBorrowModel,
                    as: `details_of_borrow`,
                    include: ["book"]
                }
            ]
        }
    )
    return response.json({
        success: true,
        data: data,
        message: `All borrowing book have been loaded`
    })
}