const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./app/models");
const Role = db.role;
const Status = db.status;
//get mongourl from .env
const MONGO_URL = process.env.MONGO_URL;
const SECRET = process.env.SECRET;

const app = express();
const session = require("express-session");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get url from request
    const url = req.url;
    // Get the second last part of url
    const urlSplit = url.split("/");
    const urlSplitLength = urlSplit.length;
    const urlSplitSecondLast = urlSplit[urlSplitLength - 2];

    // Check if url is for irs
    if (urlSplitSecondLast === "irs") {
      cb(null, "uploads/irs");
    } else if (urlSplitSecondLast === "khs") {
      cb(null, "uploads/khs");
    } else if (urlSplitSecondLast === "skripsi") {
      cb(null, "uploads/skripsi");
    }

    // cb(null, "uploads");

    // //if file is irs upload in irs folder
    // if (file.fieldname === "irs") {
    //   cb(null, "uploads/irs");
    // }
    // //if file is krs upload in krs folder
    // if (file.fieldname === "krs") {
    //   cb(null, "uploads/krs");
    // }
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//use multer
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("file")
);

var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors(corsOptions));
// app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to index test page." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/khs.routes")(app);
require("./app/routes/skripsi.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "mahasiswa",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'mahasiswa' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });

      new Role({
        name: "dosen",
      }).save((err) => {
        if (err) {
          console.log("error", err);  
        }

        console.log("added 'dosen' to roles collection");
      });

      new Role({
        name: "departemen",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'departemen' to roles collection");
      });
    }
  });
  Status.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Status({
        name: "aktif",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Aktif' to status collection");
      });

      new Status({
        name: "cuti",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Cuti' to status collection");
      });

      new Status({
        name: "mangkir",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Mangkir' to status collection");
      });

      new Status({
        name: "do",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'DO' to status collection");
      });

      new Status({
        name: "undur diri",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Undur Diri' to status collection");
      });

      new Status({
        name: "lulus",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Lulus' to status collection");
      });

      new Status({
        name: "meninggal dunia",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Meninggal Dunia' to status collection");
      });
    }
  });
}
