/**
 * @file jsdoc-api-docs.js
 * @description
 * Documentation-only file for myFlix API.
 * This file exists to generate consistent JSDoc HTML docs without modifying the working server code.
 */

/**
 * @typedef {Object} Director
 * @property {string} Name
 * @property {string} Bio
 * @property {string} Birth
 * @property {string} Death
 */

/**
 * @typedef {Object} Genre
 * @property {string} Name
 * @property {string} Description
 */

/**
 * @typedef {Object} Movie
 * @property {string} _id
 * @property {string} Title
 * @property {string} Description
 * @property {string} ImagePath
 * @property {Genre} Genre
 * @property {Director} Director
 * @property {boolean} Featured
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} Username
 * @property {string} Email
 * @property {string} Birthday
 * @property {Array<string>} FavoriteMovies
 */

/**
 * Root endpoint
 * @route GET /
 * @returns {string} 200 - Welcome message
 */

/**
 * Login
 * @route POST /login
 * @param {Object} req.body
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @returns {Object} 200 - Auth response
 * @returns {string} 200.token - JWT token
 * @returns {User} 200.user - User object
 * @throws {Error} 400 - Bad request / validation error
 * @throws {Error} 401 - Invalid credentials
 */

/**
 * Register user
 * @route POST /users
 * @param {Object} req.body
 * @param {string} req.body.Username - Username
 * @param {string} req.body.Password - Password
 * @param {string} req.body.Email - Email
 * @param {string} [req.body.Birthday] - Birthday (optional)
 * @returns {User} 201 - Created user
 * @throws {Error} 400 - Validation error
 */

/**
 * Get all users (JWT protected if your API enforces it)
 * @route GET /users
 * @security BearerAuth
 * @returns {Array<User>} 200 - Array of users
 * @throws {Error} 401 - Unauthorized
 */

/**
 * Get all movies (JWT protected)
 * @route GET /movies
 * @security BearerAuth
 * @returns {Array<Movie>} 200 - Array of movies
 * @throws {Error} 401 - Unauthorized
 */

/**
 * Get a single movie by title (JWT protected)
 * @route GET /movies/:Title
 * @security BearerAuth
 * @param {string} Title.path.required - Movie title
 * @returns {Movie} 200 - Movie object
 * @throws {Error} 401 - Unauthorized
 * @throws {Error} 404 - Movie not found
 */

/**
 * Get genre by name (JWT protected)
 * @route GET /genre/:Name
 * @security BearerAuth
 * @param {string} Name.path.required - Genre name
 * @returns {Genre} 200 - Genre object
 * @throws {Error} 401 - Unauthorized
 * @throws {Error} 404 - Genre not found
 */

/**
 * Get director by name (JWT protected)
 * @route GET /director/:Name
 * @security BearerAuth
 * @param {string} Name.path.required - Director name
 * @returns {Director} 200 - Director object
 * @throws {Error} 401 - Unauthorized
 * @throws {Error} 404 - Director not found
 */

/**
 * Update user (JWT protected)
 * @route PUT /users/:Username
 * @security BearerAuth
 * @param {string} Username.path.required - Username
 * @param {Object} req.body - Fields to update
 * @param {string} [req.body.Username] - New username
 * @param {string} [req.body.Password] - New password
 * @param {string} [req.body.Email] - New email
 * @param {string} [req.body.Birthday] - New birthday
 * @returns {User} 200 - Updated user
 * @throws {Error} 401 - Unauthorized
 * @throws {Error} 400 - Validation error
 */

/**
 * Add favorite movie (JWT protected)
 * @route POST /users/:Username/movies/:MovieID
 * @security BearerAuth
 * @param {string} Username.path.required - Username
 * @param {string} MovieID.path.required - Movie ID
 * @returns {User} 200 - Updated user with favorites
 * @throws {Error} 401 - Unauthorized
 */

/**
 * Remove favorite movie (JWT protected)
 * @route DELETE /users/:Username/movies/:MovieID
 * @security BearerAuth
 * @param {string} Username.path.required - Username
 * @param {string} MovieID.path.required - Movie ID
 * @returns {User} 200 - Updated user with favorites
 * @throws {Error} 401 - Unauthorized
 */

/**
 * Delete user (JWT protected)
 * @route DELETE /users/:Username
 * @security BearerAuth
 * @param {string} Username.path.required - Username
 * @returns {string} 200 - Confirmation message
 * @throws {Error} 401 - Unauthorized
 */

/**
 * JWT Authentication (Passport)
 * @description
 * This API uses Passport JWT strategy. Clients must send:
 * Authorization: Bearer <token>
 * for protected endpoints.
 * @security BearerAuth
 */
