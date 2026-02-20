# StudyFlow

StudyFlow is an AI-powered study companion that transforms your notes and documents into interactive quizzes. Upload your study materials (PDF, DOCX, or text), select key concepts, and let Gemini-powered AI generate challenging questions to test your knowledge.

## Features

- **Smart Document Parsing** — Support for PDF, DOCX, and plain text files.
- **AI Question Generation** — Instantly creates relevant multiple-choice questions using Google's Gemini AI.
- **Interactive Quizzes** — Take quizzes directly in the app with immediate feedback.
- **Modern Interface** — Sleek, glassmorphism-inspired UI built with Tailwind CSS and Framer Motion.
- **Split-View Mode** — Read your document and take the quiz side-by-side.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud Atlas URI)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd StudyFlow
    ```

2.  **Install server dependencies**

    ```bash
    cd server
    npm install
    ```

3.  **Install client dependencies**

    ```bash
    cd ../client
    npm install
    ```

### Configuration

Set up the environment variables for the backend server.

1.  Navigate to the `server` directory.
2.  Create a new file named `.env`.
3.  Add the following variables:

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

### Running the Application

You need to run both the backend and frontend servers.

**1. Start the Backend Server**

Open a terminal and run:

```bash
cd server
npm run dev
```

Expected output: `Server running on http://localhost:5000` and `MongoDB Connected`.

**2. Start the Frontend Client**

Open a separate terminal window and run:

```bash
cd client
npm run dev
```

Expected output: `Local: http://localhost:5173`.

**3. Open the App**

Navigate to `http://localhost:5173` in your browser.

## Tech Stack

| Layer             | Technologies                                              |
| ----------------- | --------------------------------------------------------- |
| **Frontend**      | React, Vite, Tailwind CSS v4, Framer Motion, Lucide React |
| **Backend**       | Node.js, Express.js                                       |
| **Database**      | MongoDB, Mongoose                                         |
| **AI**            | Google Gemini SDK (`@google/genai`)                       |
| **File Handling** | Multer, PDF-parse, Mammoth                                |

## Contributing

Contributions are welcome. Feel free to fork this project and submit pull requests.

## License

Distributed under the MIT License.
