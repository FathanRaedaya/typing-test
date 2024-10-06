const words = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", 
    "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", 
    "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", 
    "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", 
    "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", 
    "time", "no", "just", "him", "know", "take", "person", "into", "year", "your", 
    "good", "some", "could", "them", "see", "other", "than", "then", "now", 
    "look", "only", "come", "its", "over", "think", "also", "back", "after", 
    "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", 
    "want", "because", "any", "these", "give", "day", "most", "us", "is", "am", 
    "are", "was", "were", "has", "had", "been", "being", "were", "where", "those", 
    "much", "many", "too", "more", "such", "each", "own", "shall", "ought", 
    "while", "since", "might", "must", "therefore", "thus", "still", "between", 
    "around", "every", "before", "under", "upon", "without", "against", "within", 
    "although", "during", "again", "always", "both", "however", "whenever", 
    "instead", "either", "neither", "already", "perhaps", "maybe", "probably", 
    "yet", "often", "likely", "seem", "seems", "seemed", "among", "another", 
    "least", "less", "moreover", "whom", "whose", "whenever", "wherever", 
    "thereupon", "whereupon", "whatever", "whoever", "whichever", "through", 
    "though", "until", "often", "despite", "about", "toward", "towards", 
    "beside", "besides", "within", "beyond", "either", "neither", "such"
  ];
  
  class TypingTest {
    constructor(wordList, testDurationSeconds = 15) {
        this.words = wordList;
        this.testTime = testDurationSeconds * 1000;
        this.timer = null;
        this.testStart = null;
        this.pauseTime = 0;
        
        this.wordsContainer = document.getElementById("words");
        this.cursor = document.getElementById("cursor");
        this.timeDisplay = document.getElementById("time");
        this.testElement = document.getElementById("test");
        this.restartButton = document.getElementById("restartButton");
        
        this.initialise();
    }

    initialise() {
        this.setupEventListeners();
        this.newTest();
    }

    setupEventListeners() {
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        
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

    handleKeyPress(event) {
        const key = event.key;
        const currentWord = document.querySelector(".word.current");
        const currentLetter = document.querySelector(".letter.current");
        const expectedLetter = currentLetter?.innerHTML || "";
        const isLetter = key.length === 1 && key.match(/[a-z]/i);
        const isSpace = key === " ";

        if (isLetter) {
            this.handleLetterInput(key, currentWord, currentLetter, expectedLetter);
        }

        if (isSpace) {
            this.handleSpaceInput(currentWord, expectedLetter);
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

    handleRestart() {
        if (this.testElement) {
            this.testElement.style.opacity = "0";
            setTimeout(() => {
                this.newTest();
                this.testElement.style.opacity = "1";
                this.testElement.focus();
            }, 100);
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
        this.timer = null;
        this.testStart = null;
        this.pauseTime = 0;

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

        this.timeDisplay.innerHTML = (this.testTime / 1000).toString();
    }
}

const typingTest = new TypingTest(words);