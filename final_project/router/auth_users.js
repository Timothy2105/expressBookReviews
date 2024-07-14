const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const userMatches = users.filter((user) => user.username === username);
    return userMatches.length > 0;
}

const authenticatedUser = (username, password) => {
    const matchingUsers = users.filter((user) => user.username === username && user.password === password);
    return matchingUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({data:password}, "access", {expiresIn: 3600});
        req.session.authorization = {accessToken,username};
        return res.status(200).send("User successfully logged in");
    }
    else {
        return res.status(208).json({message: "Invalid username or password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Get the review from the query parameters
    const username = req.session.authorization.username;

    // Check if the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review is required." });
    }

    if (books[isbn]) {
        let book = books[isbn];

        // Add or update the review for the user
        book.reviews[username] = review;
        return res.status(200).json({ message: `Review for the book with the ISBN ${isbn} was successfully added/updated.` });
    } else {
        return res.status(404).json({ message: `ISBN ${isbn} not found.` });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if (books[isbn]) {
        let book = books[isbn];
        delete book.reviews[username];
        return res.status(200).send("Review successfully deleted");
    }
    else {
        return res.status(404).json({message: `ISBN ${isbn} not found`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
