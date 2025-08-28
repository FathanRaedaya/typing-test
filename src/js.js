
class TypingTest {
    constructor(easyWords, mediumWords, hardWords, initialTesttimeSeconds = 15) {
        this.easyWords = easyWords;
        this.mediumWords = mediumWords;
        this.hardWords = hardWords;
        this.currentDifficulty = 'easy';
        this.words = this.easyWords;
        this.testTime = initialTesttimeSeconds * 1000;
        this.timer = null;
        this.testStart = null;
        this.pauseTime = 0;
        
        this.wordsContainer = document.getElementById("words");
        this.cursor = document.getElementById("cursor");
        this.timeDisplay = document.getElementById("time");
        this.testElement = document.getElementById("test");
        this.restartButton = document.getElementById("restartButton");
        this.timeOptions = document.getElementById("timeOptions");
        this.difficultyOptions = document.getElementById("difficultyOptions");
        this.wpm = document.getElementById("wpm");
        this.accuracy = document.getElementById("accuracy");
        this.start = document.getElementById("start");

        this.initialise();
    }

    initialise() {
        this.setupEventListeners();
        this.setuptimeOptions();
        this.setupDifficultyOptions();
        this.newTest();
    }

    setupEventListeners() {
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handletimeChange = this.handletimeChange.bind(this);
        this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
        
        this.testElement?.addEventListener("keydown", this.handleKeyPress);
        this.restartButton?.addEventListener("click", this.handleRestart);
        
        document.addEventListener("DOMContentLoaded", () => {
            if (this.testElement) {
                this.testElement.addEventListener("click", () => this.testElement.focus());
                document.addEventListener("keydown", () => {
                    if (document.activeElement !== this.testElement) {
                        this.testElement.focus();
                    }
                });
            }
        });
    }

    setupDifficultyOptions() {
        const difficulties = ['easy', 'medium', 'hard'];
        difficulties.forEach(difficulty => {
            const button = document.createElement("button");
            button.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            button.className = "difficulty-option";
            button.addEventListener("click", () => this.handleDifficultyChange(difficulty));
            this.difficultyOptions.appendChild(button);
        });
        this.updateDifficultyButtonStyles();
    }

    handleDifficultyChange(difficulty) {
        this.currentDifficulty = difficulty;
        switch (difficulty) {
            case 'easy':
                this.words = this.easyWords;
                break;
            case 'medium':
                this.words = this.mediumWords;
                break;
            case 'hard':
                this.words = this.hardWords;
                break;
        }
        this.updateDifficultyButtonStyles();
        this.restartTest();
    }

    updateDifficultyButtonStyles() {
        const buttons = this.difficultyOptions.querySelectorAll(".difficulty-option");
        buttons.forEach(button => {
            if (button.textContent.toLowerCase() === this.currentDifficulty) {
                button.style.opacity = "1";
            } else {
                button.style.opacity = "0.5";
            }
        });
    }

    setuptimeOptions() {
        const times = [15, 30, 60, 120];
        times.forEach(time => {
            const button = document.createElement("button");
            button.textContent = `${time}`;
            button.className = "time-option";
            button.addEventListener("click", () => this.handletimeChange(time));
            this.timeOptions.appendChild(button);
        });
        this.updatetimeButtonStyles();
    }

    handletimeChange(time) {
        this.testTime = time * 1000;
        this.updatetimeButtonStyles();
        this.restartTest();
    }

    updatetimeButtonStyles() {
        const buttons = this.timeOptions.querySelectorAll(".time-option");
        buttons.forEach(button => {
            if (parseInt(button.textContent) === this.testTime / 1000) {
                button.style.opacity = "1";
            } else {
                button.style.opacity = "0.5";
            }
        });
    }

    testOver() {
        clearInterval(this.timer);
        this.timer = null;
        
        const wpm = this.calculateWPM();
        const letterAccuracy = this.calculateLetterAccuracy();
        this.testElement.removeEventListener("keydown", this.handleKeyPress);

        this.start.style.opacity= "0";
        this.timeDisplay.innerHTML = "";
        this.cursor.style.display = "none";
        this.wordsContainer.style.display = "none";
        this.wpm.innerHTML = `WPM: ${wpm}`;
        this.accuracy.innerHTML = `Accuracy: ${letterAccuracy}%`;

        
        if (this.restartButton) {
            this.restartButton.disabled = false;
        }
    }

    calculateWPM() {
        const timeElapsed = Date.now() - this.testStart;
        const words = [...document.querySelectorAll(".word")];
        const lastTypedWord = document.querySelector(".word.current");
        const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
        const typedWords = words.slice(0, lastTypedWordIndex);
        
        const correctWords = typedWords.filter(word => {
            const letters = [...word.children];
            const incorrectLetters = letters.filter(letter => 
                letter.className.includes("incorrect")
            );
            const correctLetters = letters.filter(letter => 
                letter.className.includes("correct")
            );
            return incorrectLetters.length === 0 && correctLetters.length === letters.length;
        });

        return Math.round((correctWords.length / timeElapsed) * 60000);
    }

    calculateLetterAccuracy() {
        const words = [...document.querySelectorAll(".word")];
        let correctLetters = 0;
        let totalLetters = 0;

        words.forEach(word => {
            const letters = [...word.querySelectorAll(".letter")];
            letters.forEach(letter => {
                if (letter.classList.contains("correct")) {
                    correctLetters++;
                }
                if (
                    letter.classList.contains("correct") || 
                    letter.classList.contains("incorrect")
                ) {
                    totalLetters++;
                }
            });
        });

        if (totalLetters === 0) return 0;

        return Math.round((correctLetters / totalLetters) * 100);
    }


    restartTest() {
        this.handleRestart();
    }

    handleRestart() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.testElement) {
            this.testElement.style.opacity = "0";
            
            setTimeout(() => {
                this.testStart = null;
                this.pauseTime = 0;
                
                this.newTest();
                
                if (this.cursor) {
                    this.cursor.style.display = "block";
                }

                this.timeDisplay.innerHTML = (this.testTime / 1000).toString();
                
                this.testElement.style.opacity = "1";
                
                this.testElement.focus();
            }, 100);
        }
    }

    handleKeyPress(event) {
        if (!this.testStart) {
            this.testStart = Date.now();
            this.timer = setInterval(() => {
                const timeLeft = Math.ceil((this.testTime - (Date.now() - this.testStart)) / 1000);
                this.timeDisplay.innerHTML = timeLeft;
                
                if (timeLeft <= 0) {
                    this.testOver();
                }
            }, 100);
        }

        const key = event.key;
        const currentWord = document.querySelector(".word.current");
        const currentLetter = document.querySelector(".letter.current");
        const isLetter = key.length === 1 && key.match(/[a-z]/i);
        const isSpace = key === " ";
        const isBackspace = key === "Backspace";
        const expectedLetter = currentLetter?.innerHTML || "";
        const isFirstLetter = currentLetter?.previousElementSibling === null;

        if (isLetter) {
            this.handleLetterInput(key, currentWord, currentLetter, expectedLetter);
        }

        if (isSpace) {
            this.handleSpaceInput(currentWord, expectedLetter);
        }

        if (isBackspace) {
            this.handleBackspace(currentWord, currentLetter, isFirstLetter);
        }

        this.updateCursorPosition();
    }

    handleLetterInput(key, currentWord, currentLetter, expectedLetter) {
        if (currentLetter) {
            this.addClass(currentLetter, key === expectedLetter ? "correct" : "incorrect");
            this.removeClass(currentLetter, "current");
            if (currentLetter.nextElementSibling) {
                this.addClass(currentLetter.nextElementSibling, "current");
            }
        } else {
            const incorrectLetter = document.createElement("span");
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = "letter incorrect extra temporary";
            currentWord.appendChild(incorrectLetter);
        }
    }

    handleSpaceInput(currentWord, expectedLetter) {
        if (expectedLetter !== " ") {
            const lettersToInvalidate = [...currentWord.querySelectorAll(".letter:not(.correct):not(.temporary)")];
            lettersToInvalidate.forEach(letter => {
                this.addClass(letter, "incorrect");
            });
        }

        currentWord.querySelectorAll(".temporary").forEach(letter => letter.remove());
        this.moveToNextWord(currentWord);
    }

    moveToNextWord(currentWord) {
        this.removeClass(currentWord, "current");
        let nextWord = currentWord.nextElementSibling;
        
        while (nextWord && nextWord.nodeType === Node.TEXT_NODE) {
            nextWord = nextWord.nextElementSibling;
        }

        if (nextWord && nextWord.classList.contains("word")) {
            this.setupNextWord(nextWord);
            this.handleLineScrolling(nextWord);
        }
    }

    setupNextWord(nextWord) {
        const currentLetter = document.querySelector(".letter.current");
        if (currentLetter) {
            this.removeClass(currentLetter, "current");
        }

        this.addClass(nextWord, "current");
        const firstLetter = nextWord.querySelector(".letter");
        if (firstLetter) {
            this.addClass(firstLetter, "current");
        }
    }

    handleBackspace(currentWord, currentLetter, isFirstLetter) {
        if (!currentWord) return;

        const temporaryLetters = currentWord.querySelectorAll(".temporary");
        
        if (temporaryLetters.length > 0) {
            this.handleTemporaryLetterBackspace(temporaryLetters);
        } else if (currentLetter && isFirstLetter) {
            this.handleFirstLetterBackspace(currentWord, currentLetter);
        } else if (currentLetter && !isFirstLetter) {
            this.handleMiddleWordBackspace(currentLetter);
        } else if (!currentLetter) {
            this.handleEndWordBackspace(currentWord);
        }
    }

    handleTemporaryLetterBackspace(temporaryLetters) {
        temporaryLetters[temporaryLetters.length - 1].remove();
    }

    handleFirstLetterBackspace(currentWord, currentLetter) {
        let previousWord = this.findPreviousWordElement(currentWord);
        
        if (!previousWord || !previousWord.classList.contains("word")) {
            return;
        }

        const previousWordLetters = previousWord.querySelectorAll(".letter");
        if (!previousWordLetters.length) return;

        const isFullyCorrect = Array.from(previousWordLetters)
            .every(letter => letter.classList.contains("correct"));

        if (isFullyCorrect) {
            return;
        }

        this.moveBackToPreviousWord(currentWord, currentLetter, previousWord);
    }

    findPreviousWordElement(currentWord) {
        let previousWord = currentWord.previousSibling;
        while (previousWord && previousWord.nodeType === Node.TEXT_NODE) {
            previousWord = previousWord.previousSibling;
        }
        return previousWord;
    }

    moveBackToPreviousWord(currentWord, currentLetter, previousWord) {
        this.removeClass(currentWord, "current");
        this.addClass(previousWord, "current");
        this.removeClass(currentLetter, "current");
        
        if (previousWord.lastChild) {
            this.addClass(previousWord.lastChild, "current");
            this.removeClass(previousWord.lastChild, "incorrect");
            this.removeClass(previousWord.lastChild, "correct");
        }
    }

    handleMiddleWordBackspace(currentLetter) {
        const previousLetter = currentLetter.previousElementSibling;
        if (!previousLetter) return;

        this.removeClass(currentLetter, "current");
        this.addClass(previousLetter, "current");
        this.removeClass(previousLetter, "incorrect");
        this.removeClass(previousLetter, "correct");
    }

    handleEndWordBackspace(currentWord) {
        const lastLetter = currentWord.lastChild;
        if (!lastLetter) return;
        
        if (!lastLetter.classList.contains("temporary")) {
            this.addClass(lastLetter, "current");
            this.removeClass(lastLetter, "incorrect");
            this.removeClass(lastLetter, "correct");
        }
    }

    handleLineScrolling(currentWord) {
        if (!currentWord) return;

        const words = document.getElementById("words");
        const container = words.parentElement;
        const lineHeight = 50;
        const maxVisibleLines = 2;

        const wordTop = currentWord.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;

        const lineIndex = Math.floor((wordTop - containerTop) / lineHeight);

        if (lineIndex >= maxVisibleLines) {
            const margin = parseInt(words.style.marginTop || "0", 10);
            words.style.transition = "margin-top 0.3s ease";
            words.style.marginTop = (margin - lineHeight) + "px";

            this.updateCursorPosition();

            setTimeout(() => {
                this.updateCursorPosition();
            }, 310);
        }
    }




    updateCursorPosition() {
        const nextLetter = document.querySelector(".letter.current");
        const nextWord = document.querySelector(".word.current");
        
        if (nextLetter) {
            const rect = nextLetter.getBoundingClientRect();
            this.cursor.style.top = `${rect.top}px`;
            this.cursor.style.left = `${rect.left}px`;
        } else if (nextWord) {
            const rect = nextWord.getBoundingClientRect();
            this.cursor.style.top = `${rect.top}px`;
            this.cursor.style.left = `${rect.right}px`;
        }
    }

    randomWord() {
        return this.words[Math.floor(Math.random() * this.words.length)];
    }

    formatWord(word) {
        return `<div class="word">${
            word.split("").map(letter => `<span class="letter">${letter}</span>`).join("")
        }</div>`;
    }

    addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    }

    removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    }

    newTest() {
        this.testStart = null;
        this.testElement.addEventListener("keydown", this.handleKeyPress);

        if (this.wordsContainer) {
            this.wordsContainer.style.display = "block";
            this.wordsContainer.innerHTML = "";
            this.wordsContainer.style.marginTop = "0px";

            const wordElements = Array.from({ length: 100 }, () => this.formatWord(this.randomWord()));
            this.wordsContainer.innerHTML = wordElements.join(" ");

            const firstWord = this.wordsContainer.querySelector(".word");
            const firstLetter = this.wordsContainer.querySelector(".letter");
            
            if (firstWord && firstLetter) {
                this.addClass(firstWord, "current");
                this.addClass(firstLetter, "current");
                this.updateCursorPosition();
            }
        }

        if (this.timeDisplay) {
            this.timeDisplay.innerHTML = (this.testTime / 1000).toString();
        }

        if (this.cursor) {
            this.cursor.style.display = "block";
        }

        if (this.start) {
            this.start.style.opacity = "1";
        }



        this.updatetimeButtonStyles();
        this.updateDifficultyButtonStyles();
    }
}

import { easyWords, mediumWords, hardWords } from './words.js';

new TypingTest(easyWords, mediumWords, hardWords);
