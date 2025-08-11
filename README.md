# 🧠 QuizThon - Interactive Quiz Application

Challenge your knowledge with QuizThon's interactive quizzes across multiple categories! Track your progress, compete with friends, and improve your skills in Science, History, Sports, and more.

## ✨ Features

- 🎯 **Multiple Categories**: Science, History, Sports, Entertainment, Geography, and more
- 🏆 **Difficulty Levels**: Easy, Medium, and Hard questions
- ⏱️ **Timed Challenges**: Dynamic timer based on difficulty
- 📊 **Progress Tracking**: Save your quiz history and track improvement
- 🔐 **User Authentication**: Google OAuth and email/password signup
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🎮 **Interactive UI**: Smooth animations and real-time feedback

## 🚀 Demo

Try the live demo: [QuizThon Live](https://your-deployment-url.com)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Google OAuth 2.0, JWT
- **API**: Open Trivia Database (OpenTDB)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/QuizThon.git
   cd QuizThon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your actual values:
   - MongoDB connection string
   - JWT secret key
   - Google OAuth credentials

4. **Run the application**
   ```bash
   # Start backend server
   npm start

   # In another terminal, start frontend (for development)
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:3001` (development)
   - `https://your-domain.com` (production)

### MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

## 📂 Project Structure

```
QuizThon/
├── assets/               # Static assets
├── script/              
│   └── main.js          # Frontend JavaScript
├── style/
│   └── styles.css       # CSS styles
├── index.html           # Main HTML file
├── profile.html         # User profile page
├── server.js            # Express backend server
├── package.json         # Dependencies
├── .env.example         # Environment template
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/profile` - Get user profile

### Quiz
- `POST /api/quiz/save-result` - Save quiz result

## 🚀 Deployment

### Vercel (Recommended for Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Render/Railway (For Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy backend service

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=https://your-frontend-domain.com
SERVER_URL=https://your-backend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Open Trivia Database](https://opentdb.com/) for providing the quiz questions
- [Google Identity Services](https://developers.google.com/identity) for authentication
- All contributors who help make this project better

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the documentation
- Contact: montasirmajumdar123@gmail.com

---

Made with ❤️ by Montasir Majumder Shariar

Portfolio: https://montasir-majumder-shariar-portfolio.vercel.app/
