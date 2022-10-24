const db = require("../models");
const csv = require("csvtojson");
const User = db.user;
const Role = db.role;
const Mahasiswa = db.mahasiswa;
const Status = db.status;
const Skripsi = db.skripsi;
const Dosen = db.dosen;
const PKL = db.pkl;
const KHS = db.khs;
const fs = require("fs");

var bcrypt = require("bcryptjs");
const { checkRolesExisted } = require("../middlewares/verifyGenerate");
const pkl = require("../models/pkl.model");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.mahasiswaBoard = (req, res) => {
    res.status(200).send("Mahasiswa Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.dosenBoard = (req, res) => {
    res.status(200).send("dosen Content.");
};

exports.departemenBoard = (req, res) => {
    res.status(200).send("departemen Content.");
};

exports.signup = (req, res) => {
    const user = new User({
        username: req.body.nim,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.name.toLowerCase().split(" ")[0], 8),
    });

    const mahasiswa = new Mahasiswa({
        name: req.body.name,
        email: req.body.email,
        nim: req.body.nim,
        user: user._id,
        angkatan: req.body.angkatan,
        kodeWali: req.body.kodeWali,
    });

    const skripsi = new Skripsi({
        status: req.body.skripsi,
        nilai: req.body.nilai,
        tanggal: req.body.tanggal,
        lama_studi: req.body.lama_studi,
        status_konfirmasi: req.body.status_konfirmasi,
        updlaod: req.body.upload_skripsi,
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles },
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    user.roles = roles.map((role) => role._id);
                    user.save((err) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }

                        res.send({
                            message: "User was registered successfully!",
                        });
                    });
                }
            );
        } else {
            //if roles is empty then assign mahasiswa role and make mahasiswa
            Role.findOne({ name: "mahasiswa" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = [role._id];
                user.save((err) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    if (req.body.status) {
                        Status.findOne({ name: req.body.status }, (err, status) => {
                            if (err) {
                                res.status(500).send({ message: err });
                                return;
                            }
                            mahasiswa.status = status._id;
                            mahasiswa.save((err) => {
                                if (err) {
                                    res.status(500).send({ message: err });
                                    return;
                                }
                                res.send({
                                    message: "User was registered successfully!",
                                });
                            });
                        });
                    }
                });
            });
        }
    });
};

exports.listUser = (req, res) => {
    User.find({}, { password: 0 })
        .populate("roles", "name")
        .exec(function (err, users) {
            var userMap = [];

            users.forEach(function (user) {
                userMap.push(user);
            });

            res.send(userMap);
        });
};

exports.listDataMahasiswa = (req, res) => {
    Mahasiswa.find({})
        .populate("status kodeWali", "name")
        .exec(function (err, mahasiswa) {
            var mahasiswaMap = [];

            mahasiswa.forEach(function (mahasiswa) {
                mahasiswaMap.push(mahasiswa);
            });

            res.send(mahasiswaMap);
        });
};

exports.signUpDosen = (req, res) => {
    const user = new User({
        username: req.body.nip,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.name.toLowerCase().split(" ")[0], 8),
    });

    const dosen = new Dosen({
        name: req.body.name,
        email: req.body.email,
        nip: req.body.nip,
        user: user._id,
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles },
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    user.roles = roles.map((role) => role._id);
                    user.save((err) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }

                        res.send({
                            message: "Dosen was registered successfully!",
                        });
                    });
                }
            );
        } else {
            //if roles is empty then assign mahasiswa role and make mahasiswa
            Role.findOne({ name: "dosen" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = [role._id];
                user.save((err) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    dosen.save((err) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.send({
                            message: "Dosen was registered successfully!",
                        });
                    });
                });
            });
        }
    });
};

exports.listDosen = (req, res) => {
    Dosen.find({})
        .populate("roles", "name")
        .exec(function (err, dosen) {
            var dosenMap = [];

            dosen.forEach(function (dosen) {
                dosenMap.push(dosen);
            });

            res.send(dosenMap);
        });
};

// create batch generate user for mahasiswa using csv file
exports.createBatchUser = (req, res) => {
    // create batch user for mahasiwa from csv file using csvtojson
    const file = req.file.path;
    csv()
        .fromFile(file)
        .then((jsonObj) => {
            // console.log(jsonObj);
            jsonObj.forEach((data) => {
                const user = new User({
                    username: data.nim,
                    email: data.email,
                    password: bcrypt.hashSync(data.name.toLowerCase().split(" ")[0], 8),
                });

                const mahasiswa = new Mahasiswa({
                    name: data.name,
                    nim: data.nim,
                    email: data.email,
                    user: user._id,
                    angkatan: data.angkatan,
                    kodeWali: data.kodeWali,
                });

                user.save((err, user) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    if (req.body.roles) {
                        Role.find(
                            {
                                name: { $in: req.body.roles },
                            },
                            (err, roles) => {
                                if (err) {
                                    res.status(500).send({ message: err });
                                    return;
                                }

                                user.roles = roles.map((role) => role._id);
                                user.save((err) => {
                                    if (err) {
                                        res.status(500).send({ message: err });
                                        return;
                                    }
                                    // res.send({
                                    //   message: "User was registered successfully!",
                                    //   // data: user
                                    // });
                                });
                            }
                        );
                    } else {
                        //if roles is empty then assign mahasiswa role and make mahasiswa
                        Role.findOne({ name: "mahasiswa" }, (err, role) => {
                            if (err) {
                                res.status(500).send({ message: err });
                                return;
                            }

                            user.roles = [role._id];
                            user.save((err) => {
                                if (err) {
                                    res.status(500).send({ message: err });
                                    return;
                                }
                                mahasiswa.save((err) => {
                                    if (err) {
                                        res.status(500).send({ message: err });
                                        return;
                                    }
                                });
                            });
                        });
                    }
                });
            });
            res.status(200).json({
                message: "Mahasiswa was registered successfully!",
                data: jsonObj,
            });
        });
};

exports.deleteAllMhs = async (req, res) => {
    const mhs = await Role.findOne({
        name: "mahasiswa",
    });
    // console.log(mhs._id);

    // const list_mhs = await User.find({ roles: mhs._id });

    // res.status(200).send(list_mhs);

    User.deleteMany({ roles: mhs._id }, (err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send(data);
    });
};

exports.getRekapAllMhs = async (req, res) => {
    const lulus_skripsi = await Skripsi.count({ status_konfirmasi: "sudah" });
    const tidak_skripsi = await Skripsi.count({ status_konfirmasi: "belum" });
    const lulus_pkl = await PKL.count({ status_konfirmasi: "sudah" });
    const tidak_pkl = await PKL.count({ status_konfirmasi: "belum" });

    const aktif = await Mahasiswa.count({ status: "Aktif" });
    const cuti = await Mahasiswa.count({ status: "Cuti" });
    const mangkir = await Mahasiswa.count({ status: "Mangkir" });
    const drop = await Mahasiswa.count({ status: "Drop Out" });
    const mengundurkan = await Mahasiswa.count({ status: "Mengundurkan Diri" });
    const lulus = await Mahasiswa.count({ status: "Lulus" });
    const meninggal = await Mahasiswa.count({ status: "Meninggal Dunia" });

    const list_mhs = await Mahasiswa.find({});
    const list_khs = [];

    for (let i = 0; i < list_mhs.length; i++) {
        khs = await KHS.find({ mahasiswa: list_mhs[i]._id });

        const new_obj = {
            name: list_mhs[i].name,
            khs,
        };

        list_khs.push(new_obj);
    }
    console.log(list_khs);

    const obj_rekap = {
        status: {
            aktif,
            cuti,
            mangkir,
            do: drop,
            mengundurkan_diri: mengundurkan,
            lulus,
            meninggal,
        },

        skripsi: {
            lulus_skripsi,
            tidak_skripsi,
        },

        pkl: {
            lulus_pkl,
            tidak_pkl,
        },
    };

    res.status(200).send(obj_rekap);
};
