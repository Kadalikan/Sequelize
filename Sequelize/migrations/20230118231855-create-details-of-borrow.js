'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('details_of_borrows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      borrowID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        refereces: {
          model: "borrows",
          key: "id"

      },
      bookID: {
        type: Sequelize.INTEGER,
        allowNull:false,
        refereces:{
          model:"books",
          key:"id"
        }
      },
      qty: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }});
  },


  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('details_of_borrows');
  }
};