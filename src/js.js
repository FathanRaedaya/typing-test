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
  
const testTime = 15 * 1000;
window.timer = null;
window.testStart = null;
window.pauseTime = 0;

function addClass(tag, name) {
    if (tag) {
        tag.className += " "+name;
    }
}

function removeClass(tag, name) {
    if (tag) {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        tag.className = tag.className.replace(regex, "").trim();
    }
}

function randomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function formatWord(word) {
    const letters = word.split('').map(letter => `<span class="letter">${letter}</span>`).join('');
    return `<div class="word">${letters}</div>`;
}

function newTest() {

    window.timer = null;
    window.testStart = null;
    window.pauseTime = 0;

    const wordsElement = document.getElementById("words");
    wordsElement.innerHTML = "";
    wordsElement.style.marginTop = '0px'; 

    for (let i = 0; i < 100; i++) {
        wordsElement.innerHTML += formatWord(randomWord()) + " ";
    }

    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    document.getElementById('time').innerHTML = (testTime / 1000) + '';

    const cursor = document.getElementById("cursor");
    const firstLetter = document.querySelector('.letter.current');
    if (firstLetter) {
        cursor.style.top = firstLetter.getBoundingClientRect().top + "px";
        cursor.style.left = firstLetter.getBoundingClientRect().left + "px";
    }

}

document.getElementById("test").addEventListener("keydown", event => {
    const key = event.key;
    const currentWord = document.querySelector(".word.current");
    const currentLetter = document.querySelector(".letter.current");
    const expectedLetter = currentLetter ? currentLetter.innerHTML : '';
    const isLetter = key.length === 1 && key.match(/[a-z]/i);
    const isSpace = key === " ";

    if (isLetter) {
        if (currentLetter) {
            addClass(currentLetter, key === expectedLetter ? "correct" : "incorrect");
            removeClass(currentLetter, "current");
            if (currentLetter.nextElementSibling) {
                addClass(currentLetter.nextElementSibling, "current");
            }
        } else {
            const incorrectLetter = document.createElement("span");
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = "letter incorrect extra temporary";
            currentWord.appendChild(incorrectLetter);
        }
    }

    if (isSpace) {
        if (expectedLetter !== " ") {
            const lettersToInvalidate = [...currentWord.querySelectorAll('.letter:not(.correct):not(.temporary)')];
            lettersToInvalidate.forEach(letter => {
                addClass(letter, 'incorrect');
            });
        }
        const temporaryLetters = currentWord.querySelectorAll('.temporary');
        temporaryLetters.forEach(letter => letter.remove());
        
        removeClass(currentWord, 'current');
        const nextWord = currentWord.nextElementSibling;
        
        let actualNextWord = nextWord;
        while (actualNextWord && actualNextWord.nodeType === Node.TEXT_NODE) {
            actualNextWord = actualNextWord.nextElementSibling;
        }
    
        if (actualNextWord && actualNextWord.classList.contains('word')) {
            const currentLetter = document.querySelector('.letter.current');
            if (currentLetter) {
                removeClass(currentLetter, 'current');
            }
    
            addClass(actualNextWord, 'current');
            const firstLetter = actualNextWord.querySelector('.letter');
            if (firstLetter) {
                addClass(firstLetter, 'current');
            }
    
            const cursor = document.getElementById("cursor");
            if (firstLetter) {
                cursor.style.top = firstLetter.getBoundingClientRect().top + "px";
                cursor.style.left = firstLetter.getBoundingClientRect().left + "px";
            } else {
                cursor.style.top = actualNextWord.getBoundingClientRect().top + "px";
                cursor.style.left = actualNextWord.getBoundingClientRect().left + "px";
            }
        }
    }

    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector(".word.current");
    const cursor = document.getElementById("cursor");
    if (nextLetter) {
        cursor.style.top = nextLetter.getBoundingClientRect().top + "px";
        cursor.style.left = nextLetter.getBoundingClientRect().left + "px";
    } else if (nextWord) {
        cursor.style.top = nextWord.getBoundingClientRect().top + "px";
        cursor.style.left = nextWord.getBoundingClientRect().right + "px";
    }

});

document.getElementById('restartButton').addEventListener('click', () => {
    const testElement = document.getElementById('test');
    testElement.style.opacity = '0';
    
    setTimeout(() => {
        newTest();
        testElement.style.opacity = '1'; 
        testElement.focus(); 
    }, 100); 
});

document.addEventListener('DOMContentLoaded', function() {
    const testElement = document.getElementById('test');

    function focusTest() {
        testElement.focus();
    }

    testElement.addEventListener('click', focusTest);

    document.addEventListener('keydown', function(event) {
        if (document.activeElement !== testElement) {
            focusTest();
        }
    });

    newTest();
});

