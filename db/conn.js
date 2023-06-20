const { Sequelize} = require('sequelize');

const sequelize = new Sequelize('toughts', 'root', '',{
    host: 'localhost',
        dialect:'mysql',
    
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully!');

} catch (error) {
    console.error(error);
    
}

module.exports = sequelize;
  