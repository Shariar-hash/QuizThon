# QuizThon - Quiz Application with MongoDB Integration

A full-stack quiz application with user authentication and persistent quiz history using MongoDB.

## Features

- 🔐 User authentication (signup/login)
- 📊 Quiz history tracking
- 🎯 Multiple difficulty levels (Easy, Medium, Hard)
- ⏱️ Timer-based questions
- 📱 Responsive design
- 💾 Persistent data storage with MongoDB

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas account)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
- Install MongoDB locally
- Start MongoDB service
- The app will connect to `mongodb://localhost:27017/quizthon`

#### Option B: MongoDB Atlas (Cloud)
- Create a free MongoDB Atlas account
- Create a new cluster
- Get your connection string
- Update the `.env` file with your MongoDB Atlas URI

### 3. Environment Configuration

Update the `.env` file with your settings:

```env
MONGODB_URI=mongodb://localhost:27017/quizthon
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/quizthon
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_complex
PORT=3000
```

**Important:** Replace `your_jwt_secret_key_here_make_it_long_and_complex` with a strong, unique secret key.

### 4. Run the Application

#### Start the Backend Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

#### Access the Application
Open your browser and go to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Quiz
- `POST /api/quiz/save-result` - Save quiz result (requires authentication)
- `GET /api/quiz/history` - Get quiz history (requires authentication)

## Project Structure

```
QuizThon/
├── server.js              # Backend server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── index.html             # Frontend HTML
├── script/
│   └── main.js           # Frontend JavaScript
├── style/
│   └── styles.css        # Frontend CSS
└── README.md             # This file
```

## How It Works

1. **User Authentication**: Users can sign up or log in. JWT tokens are used for session management.
2. **Quiz Taking**: Users select difficulty and category, then answer questions with a timer.
3. **History Tracking**: Quiz results are automatically saved to the user's history in MongoDB.
4. **Persistent Sessions**: Users remain logged in across browser sessions using localStorage.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs for password hashing
- **Quiz Data**: Open Trivia Database API

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation and sanitization
- CORS protection
- Environment variable protection

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check your Atlas connection string
   - Verify the MONGODB_URI in your `.env` file

2. **Server Won't Start**
   - Check if port 3000 is already in use
   - Verify all dependencies are installed with `npm install`

3. **Authentication Issues**
   - Make sure JWT_SECRET is set in `.env`
   - Clear browser localStorage if having login issues

### Development Tips

- Use `npm run dev` for development with auto-restart
- Check browser console for any JavaScript errors
- Monitor server logs for backend issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
