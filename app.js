const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const globalErrorHandler = require("./Controllers/middelwareError");
const ErrorHandling = require("./Utils/errorHandling");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const AuthRouter = require("./Routes/Auth");
const usersRouter = require("./Routes/users");
const booksRouter = require("./Routes/books");
const borrowinBooksRouter = require("./Routes/borrowingBooks");
const analyticalsRouter = require("./Routes/analitics");
const app = express();
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    key: "user",
    name: "jwt",
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.BD_URI,
      autoRemove: "interval",
      autoRemoveInterval: 10, // In minutes. Default
      ttl: 1 * 60 * 60, // = 1 hour.
    }),
    cookie: {
      sameSite: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: "POST,GET,PUT,DELETE",
  })
);

app.use("/api/v1/Auth", AuthRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/checkOutBooks", borrowinBooksRouter);
app.use("/api/v1/analyticals", analyticalsRouter);
app.all("*", (req, res, next) => {
  const err = new ErrorHandling(
    `Can't find ${req.originalUrl} on the server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
