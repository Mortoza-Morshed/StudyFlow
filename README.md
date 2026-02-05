# StudyFlow 🎓

StudyFlow is an AI-powered study companion that transforms your notes and documents into interactive quizzes. Upload your study materials (PDF, DOCX, or text), select key concepts, and let our Gemini-powered AI generate challenging questions to test your knowledge.

## ✨ Features

- **Smart Document Parsing**: Support for PDF, DOCX, and plain text files.
- **AI Question Generation**: Instantly creates relevant multiple-choice questions using Google's Gemini AI.
- **Interactive Quizzes**: Take quizzes directly in the app with immediate feedback.
- **Modern Interface**: sleek, glassmorphism-inspired UI built with Tailwind CSS and Framer Motion.
- **Split-View Mode**: Read your document and take the quiz side-by-side.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud Atlas URI)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 📥 Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd StudyHelper
    ```

2.  **Install Server Dependencies**

    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### ⚙️ Configuration

You need to set up the environment variables for the backend server to connect to the database and the AI service.

1.  Navigate to the `server` directory.
2.  Create a new file named `.env`.
3.  Add the following variables to it:

    ```env
    # server/.env

    # Port for the backend server
    PORT=5000

    # MongoDB Connection String
    # If running locally:
    MONGODB_URI=mongodb://localhost:27017/studyflow

    # Or if using MongoDB Atlas:
    # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studyflow

    # Google Gemini API Key
    GEMINI_API_KEY=your_actual_api_key_here
    ```

    > **Note:** Replace `your_actual_api_key_here` with the key you generated from Google AI Studio.

### 🏃‍♂️ Running the Application

You need to run both the backend and frontend servers.

**1. Start the Backend Server**
Open a terminal and run:

```bash
cd server
npm run dev
```

_You should see: "Server running on http://localhost:5000" and "MongoDB Connected"_

**2. Start the Frontend Client**
Open a **new** terminal window and run:

```bash
cd client
npm run dev
```

_You should see a link like: "Local: http://localhost:5173"_

**3. Use the App**
Open your browser and navigate to `http://localhost:5173`.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **AI**: Google Gemini SDK (`@google/genai`)
- **File Handling**: Multer, PDF-parse, Mammoth

## 🤝 Contributing

Feel free to fork this project and submit pull requests. Any contributions you make are **greatly appreciated**.

