/** load model for `members` table */
const memberModel = require(`../models/index`).member

/** load Operation from Sequelize */
const Op = require(`sequelize`).Op
const path = require(`path`)
const fs = require(`fs`)
const upload = require(`./upload-profile`).single(`profile`)

// load member validation
const memberValidation = require(`../middlewares/member-validation`)

/** create function for read all data */
exports.getAllMember = async (request, response) => {
    /** call findAll() to get all data */
    let members = await memberModel.findAll()
    return response.json({
        success: true,
        data: members,
        message: `All Members have been loaded`
    })
}

/** create function for filter */
exports.findMember = async (request, response) => {
    /** define keyword to find data */
    let keyword = request.body.keyword
    let members = await memberModel.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.substring]: keyword } },
                { gender: { [Op.substring]: keyword } },
                { contact: {[Op.substring]: keyword}},
                { address: { [Op.substring]: keyword } }
            ]
        }
    })

    return response.json({
        success: true,
        data: members,
        message: `All Members have been loaded`
    })
}

exports.addMember = async (request, response) => {
    upload(request, response, async error => {
        if (error) {
            return response.json({ message: error })
        }
        if (!request.file) {
            return response.json({ message: `Nothing to upload` })
        }

        // proses validasi data
        let resultValidation = memberValidation(request)
        if(! resultValidation.status) {
            return response.json({
                status:false,
                message:resultValidation.message
            })
        }

        let newMember = {
            name: request.body.name,
            address: request.body.address,
            gender: request.body.gender,
            contact: request.body.contact,
            profile: request.file.filename
        }
        memberModel.create(newMember)
            .then(result => {
                return response.json({
                    success: true,
                    data: result,
                    message: 'New member has been inserted'
                })
            })
            .catch(error => {
                return response.json({
                    success: false,
                    message: error.message
                })
            })
    })
}

exports.updateMember = (request, response) => {
    let idMember = request.params.id
    upload(request, response, async error => {
        if (error) {
            return response.json({ message: error })
        }
        let dataMember = {
            name: request.body.name,
            address: request.body.address,
            gender: request.body.gender,
            contact: request.body.contact
        }

        if (request.file) {
            const selectedMember = await memberModel.findOne({
                where: { id: idMember }
            })

            const oldProfileMember = selectedMember.profile
            const pathProfile = path.join(__dirname, `../profile`, oldProfileMember)

            if (fs.existsSync(pathProfile)) {
                fs.unlink(pathProfile, error => console.log(error))
            }
            dataMember.profile = request.file.filename
        }

        

        memberModel.update(dataMember, { where: { id: idMember } })
            .then(result => {
                return response.json({
                    success: true,
                    data: result,
                    message: 'Data member has been update'
                })
            })
            .catch(error => {
                return response.json({
                    success: false,
                    message: error.message
                })
            })
    })
}

/** create function for delete data */
exports.deleteMember = (request, response) => { 
    /** define id member that will be update */
    let idMember = request.params.id

    /** execute delete data based on defined id member */
    memberModel.destroy({ where: { id: idMember } })
        .then(result => {
            /** if update's process success */
            return response.json({
                success: true,
                message: `Data member has been updated`
            })
        })
        .catch(error => {
            /** if update's process fail */
            return response.json({
                success: false,
                message: error.message
            })
        })
}