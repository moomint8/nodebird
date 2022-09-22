const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: { // 해쉬화되면 길어지기 때문에
                type: Sequelize.STRING(100),
                allowNull: true,    // 카카오 등 sns로 로그인하는 경우 비밀번호가 없을 수 있음
            },
            provider: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',  // kakao 등 sns로그인 구현을 위해, 어느 방식으로 로그인했는지
            },
            snsId: {    // 카카오 로그인을 위해
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User, {
            foreignKey: 'followingId',
            as: 'Followers',
            through: 'Follow',
        });
        db.User.belongsToMany(db.User, {
            foreignKey: 'followerId',
            as: 'Followings',
            through: 'Follow',
        });
    }
};