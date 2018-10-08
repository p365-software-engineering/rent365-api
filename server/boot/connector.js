'use strict';

module.exports = function createDataSourceCache(app) {
    app.loopback.createDataSource({
        connector: app.loopback.Memory,
        file: "mydata.json"
    });
};
