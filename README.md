# IYKYK - AI-Powered Riddle Game 

**IYKYK (If You Know You Know)** is an interactive, AI-powered riddle game that challenges players with unique, dynamically generated riddles. Powered by Google's Gemini AI, the game offers endless fun across various relatable and pop-culture categories.

## Features

* **AI-Generated Riddles:** Never play the same game twice! Riddles are generated on-the-fly using the Gemini API.
* **Multiple Categories:** Choose from fun categories like *Desi Relatable Reel Riddles*, *Overthinkers Club*, and *Pop Culture*.
* **Dynamic Difficulties:** Scale the challenge from *Easy* to *Genius* mode.
* **Interactive UI & Animations:** Smooth page transitions, satisfying sticker-peel effects, and custom cursor tooltips powered by Framer Motion.
* **Immersive Audio:** Features custom sound effects for correct/wrong answers, hints, and a looping background music track.
* **Progression System:** Track your current streak and earn stars to unlock additional hints.
* **Share Your Wins:** Easily copy or share the riddles you've solved to challenge your friends.

## Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion, Canvas Confetti
* **Icons:** Lucide React
* **AI Integration:** Google Gemini API (`@google/genai`)

## Getting Started

To get this project running locally on your machine, follow these steps:

### Prerequisites
* Node.js (v18 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dhruvkasar/iykyk-riddle-game.git
   cd iykyk-riddle-game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Play the game:**
   Open your browser and navigate to `http://localhost:3000` (or the port provided in your terminal).

## Credits

* **Background Music:** "Yesterday" by [Bensound](https://www.bensound.com/)
* **AI Engine:** Google Gemini

## License

This project is open-source and available under the [MIT License](LICENSE).
