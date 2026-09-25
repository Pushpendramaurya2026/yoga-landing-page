const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const bookingsFile = path.join(__dirname, "bookings.json");

if (!fs.existsSync(bookingsFile)) {
  fs.writeFileSync(bookingsFile, "[]", "utf8");
}


// ===============================
// SAVE BOOKING
// ===============================

app.post("/book", (req, res) => {
  try {
    console.log("FORM DATA:", req.body);

    const { name, email, phone, program } = req.body;

    const bookings = JSON.parse(
      fs.readFileSync(bookingsFile, "utf8")
    );

    const newBooking = {
      id: Date.now(),
      name,
      email,
      phone,
      program,
      date: new Date().toLocaleString()
    };

    bookings.push(newBooking);

    fs.writeFileSync(
      bookingsFile,
      JSON.stringify(bookings, null, 2),
      "utf8"
    );

    console.log("✅ Booking Saved:", newBooking);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Successful</title>
      </head>

      <body style="
        font-family: Arial;
        text-align: center;
        padding: 50px;
      ">

        <h1>Booking Successful! 🎉</h1>

        <p>Thank you, ${name}.</p>
        <p>Your booking request has been received.</p>

        <br>

        <a href="/">Go Back To Website</a>

      </body>
      </html>
    `);

  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).send("Booking save nahi ho paayi.");
  }
});


// ===============================
// GET ALL BOOKINGS
// ===============================

app.get("/bookings", (req, res) => {
  try {
    const bookings = JSON.parse(
      fs.readFileSync(bookingsFile, "utf8")
    );

    res.json(bookings);

  } catch (error) {
    console.error("❌ Booking List Error:", error);

    res.status(500).json({
      error: "Bookings load nahi ho rahi hain."
    });
  }
});


// ===============================
// DELETE BOOKING
// ===============================

app.delete("/bookings/:id", (req, res) => {
  try {
    const bookings = JSON.parse(
      fs.readFileSync(bookingsFile, "utf8")
    );

    const id = Number(req.params.id);

    const updatedBookings = bookings.filter(
      booking => booking.id !== id
    );

    fs.writeFileSync(
      bookingsFile,
      JSON.stringify(updatedBookings, null, 2),
      "utf8"
    );

    res.json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("Delete Error:", error);

    res.status(500).json({
      success: false,
      message: "Booking delete nahi ho paayi."
    });
  }
});


// ===============================
// ADMIN DASHBOARD
// ===============================

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});


// ===============================
// SERVER START
// ===============================

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
