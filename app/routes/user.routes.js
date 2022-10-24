const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const { verifyGenerate } = require("../middlewares");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/all", controller.allAccess);

    app.get("/mahasiswa", [authJwt.verifyToken], controller.mahasiswaBoard);

    app.get(
        "/dosen",
        [authJwt.verifyToken, authJwt.isDosen],
        controller.dosenBoard
    );

    app.get(
        "/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminBoard
    );

    app.get(
        "/departemen",
        [authJwt.verifyToken, authJwt.isDepartemen],
        controller.departemenBoard
    );

    app.post(
        "/generate",
        [
            verifyGenerate.checkDuplicateUsernameOrEmail,
            verifyGenerate.checkRolesExisted,
            authJwt.verifyToken,
            authJwt.isAdmin,
        ],
        controller.signup
    );

    app.get(
        "/list-user",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.listUser
    );

    app.get(
        "/list-mahasiswa",
        [authJwt.verifyToken, authJwt.isMaster],
        controller.listDataMahasiswa
    );

    app.post(
        "/generate-dosen",
        [
            verifyGenerate.checkDuplicateUsernameOrEmail,
            verifyGenerate.checkRolesExisted,
            authJwt.verifyToken,
            authJwt.isAdmin,
        ],
        controller.signUpDosen
    );

    app.get(
        "/list-dosen",
        [authJwt.verifyToken, authJwt.isMaster],
        controller.listDosen
    );
    app.post(
        "/batch-generate",
        [authJwt.verifyToken, authJwt.isMaster],
        controller.createBatchUser
    );

    // app.delete(
    //     "/delete/all-mhs",
    //     [authJwt.verifyToken, authJwt.isAdmin],
    //     controller.deleteAllMhs
    // );

    app.get(
        "/rekap-mhs",
        [authJwt.verifyToken, authJwt.isDepartemen],
        controller.getRekapAllMhs
    );
};
