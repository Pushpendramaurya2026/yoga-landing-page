const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ========================================
// SESSION
// ========================================

app.use(
  session({
    secret: "yoga-admin-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    }
  })
);


// ========================================
// STATIC FILES
// ========================================

app.use(express.static(__dirname));


// ========================================
// BOOKINGS FILE
// ========================================

const bookingsFile = path.join(__dirname, "bookings.json");

if (!fs.existsSync(bookingsFile)) {
  fs.writeFileSync(bookingsFile, "[]", "utf8");
}


// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// ========================================
// LOGIN PAGE
// ========================================

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});


// ========================================
// LOGIN API
// ========================================

app.post("/login", (req, res) => {

  console.log("================================");
  console.log("LOGIN REQUEST RECEIVED");
  console.log("Username:", req.body.username);
  console.log("================================");

  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (username === "admin" && password === "12345") {

    req.session.isAdmin = true;

    console.log("✅ ADMIN LOGIN SUCCESS");

    return res.json({
      success: true,
      message: "Login successful"
    });
  }

  console.log("❌ WRONG USERNAME OR PASSWORD");

  return res.status(401).json({
    success: false,
    message: "Wrong username or password"
  });
});


// ========================================
// ADMIN AUTH CHECK
// ========================================

function requireAdmin(req, res, next) {

  if (req.session && req.session.isAdmin === true) {
    return next();
  }

  return res.redirect("/login.html");
}


// ========================================
// ADMIN DASHBOARD
// ========================================

app.get("/admin.html", requireAdmin, (req, res) => {

  res.sendFile(
    path.join(__dirname, "admin.html")
  );

});


// ========================================
// ADMIN SHORT URL
// ========================================

app.get("/admin", (req, res) => {

  if (req.session && req.session.isAdmin === true) {
    return res.redirect("/admin.html");
  }

  return res.redirect("/login.html");
});


// ========================================
// LOGOUT
// ========================================

app.get("/logout", (req, res) => {

  req.session.destroy(() => {
    res.redirect("/login.html");
  });

});


// ========================================
// SAVE BOOKING
// ========================================

app.post("/book", (req, res) => {

  try {

    console.log("FORM DATA:", req.body);

    const {
      name,
      email,
      phone,
      program
    } = req.body;


    const bookings = JSON.parse(
      fs.readFileSync(bookingsFile, "utf8")
    );


    const newBooking = {

      id: Date.now(),

      name: name || "",

      email: email || "",

      phone: phone || "",

      program: program || "",

      date: new Date().toLocaleString()

    };


    bookings.push(newBooking);


    fs.writeFileSync(
      bookingsFile,
      JSON.stringify(bookings, null, 2),
      "utf8"
    );


    console.log(
      "✅ Booking Saved:",
      newBooking
    );


    res.send(`

<!DOCTYPE html>

<html>

<head>

<title>Booking Successful</title>

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

</head>


<body style="
font-family:Arial;
text-align:center;
padding:50px;
">


<h1>
Booking Successful! 🎉
</h1>


<p>
Thank you, ${name}.
</p>


<p>
Your booking request has been received.
</p>


<br>


<a href="/">
Go Back To Website
</a>


</body>

</html>

`);

  }

  catch (error) {

    console.error(
      "❌ BOOKING ERROR:",
      error
    );

    res.status(500).send(
      "Booking save nahi ho paayi."
    );

  }

});


// ========================================
// GET ALL BOOKINGS
// ========================================

app.get("/bookings", requireAdmin, (req, res) => {

  try {

    const bookings = JSON.parse(
      fs.readFileSync(bookingsFile, "utf8")
    );

    res.json(bookings);

  }

  catch (error) {

    console.error(
      "❌ BOOKING LIST ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Bookings load nahi ho rahi hain."
    });

  }

});


// ========================================
// DELETE BOOKING
// ========================================

app.delete("/bookings/:id", requireAdmin, (req, res) => {

  try {

    const bookings = JSON.parse(
      fs.readFileSync(bookingsFile, "utf8")
    );


    const id = Number(req.params.id);


    console.log(
      "DELETE REQUEST ID:",
      id
    );


    const updatedBookings = bookings.filter(
      booking => Number(booking.id) !== id
    );


    if (updatedBookings.length === bookings.length) {

      return res.status(404).json({

        success: false,

        message: "Booking nahi mili."

      });

    }


    fs.writeFileSync(

      bookingsFile,

      JSON.stringify(
        updatedBookings,
        null,
        2
      ),

      "utf8"

    );


    console.log(
      "✅ BOOKING DELETED:",
      id
    );


    res.json({

      success: true,

      message: "Booking deleted successfully"

    });

  }

  catch (error) {

    console.error(
      "❌ DELETE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Booking delete nahi ho paayi."

    });

  }

});


// ========================================
// TEST LOGIN ROUTE
// ========================================

app.get("/test-login", (req, res) => {

  res.send(
    "LOGIN ROUTE SERVER PAR AVAILABLE HAI ✅"
  );

});


// ========================================
// 404 ERROR
// ========================================

app.use((req, res) => {

  res.status(404).send(
    `Cannot ${req.method} ${req.originalUrl}`
  );

});


// ========================================
// SERVER START
// ========================================

console.log("🔥 THIS IS MY NEW SERVER FILE");

app.listen(PORT, () => {

  console.log(
    `Server running at http://localhost:${PORT}`
  );

});