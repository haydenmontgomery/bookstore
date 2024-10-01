process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");
const Test = require("supertest/lib/test");

beforeEach(async function () {
    let result = db.query(`
        INSERT INTO 
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
            VALUES(
            '1234567',
            'http://testaddress.com',
            'Test Author',
            'test',
            123,
            'Test Publisher',
            'Test Title',
            0)`);
});

describe("GET / and GET /:id routes Test", function () {
    test("get all", async function () {
        const response = await request(app).get("/books");
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("author");
    });

    test("can get one", async function () {
        const response = await request(app).get("/books/1234567");
        const book = response.body.book;
        expect(book).toHaveProperty("author");
    });

    test("404 for book not found", async function () {
        const response = await request(app)
            .get(`/books/0`)
        expect(response.statusCode).toBe(404);
    });
});

describe("POST /books", function () {
    test("can create", async function () {
        const response = await request(app).post('/books').send({
            "isbn": "5555",
            "amazon_url": "http://testaddress3.com",
            "author": "Test Author3",
            "language": "test3",
            "pages": 1234,
            "publisher": "Test Publisher3",
            "title": "Test Title3",
            "year": 2024
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("author");
    });

    test("Prevents creating book without required title", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({year: 2000});
        expect(response.statusCode).toBe(400);
    });
});

describe("PUT /books/:isbn", function() {
    test("Can update", async function() {
        const response = await request(app).put('/books/1234567').send({
            "isbn": "333",
            "amazon_url": "http://testaddress.com",
            "author": "Test Update",
            "language": "test",
            "pages": 123,
            "publisher": "Test Publisher",
            "title": "Test Title",
            "year": 0
        });
        expect(response.body.book).toHaveProperty("author");
        expect(response.body.book.author).toEqual("Test Update");
    });

    test("Does not allow improper updates", async function() {
        const response = await request(app).put('/books/1234567').send({
            "isbn": "333",
            "amazon_url": 2324,
            "author": "Test Update",
            "language": "test",
            "pages": 123,
            "publisher": "Test Publisher",
            "title": "Test Title",
            "year": 0
        });
        expect(response.statusCode).toBe(400);
    });

    test("404 for book not found", async function () {
        const response = await request(app)
            .put(`/books/0`)
        expect(response.statusCode).toBe(404);
    });
});

describe("DELETE /books/:isbn", function() {

    test("Delete a book", async function() {
        const response = await request(app).delete('/books/1234567');
        expect(response.body).toEqual({
            message: "Book deleted"
        });
    });
});

afterEach(async function () {
    await db.query("DELETE FROM books");
});

afterAll(async function () {
    await db.end();
});