import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 10;
const NUMBER_OF_LETTERS = 8;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "scranton"

console.log(rightGuessString)

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < NUMBER_OF_LETTERS; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != NUMBER_OF_LETTERS) {
        toastr.error("Not enough letters!")
        return
    }

    // if (!WORDS.includes(guessString)) {
    //     toastr.error("Word not in list!")
    //     return
    // }

    // basically, makes an array to hold the colors, initialized with unfilled
    // then loops through once (real word), setting green for matched and adding unmatched to a dictionary (k=letter, v=count unmatched)
    // finally, loops through again (guess), looking for letter in unmatched, and determining yellow and gray, then decrementing accordingly
    let colors = new Array(NUMBER_OF_LETTERS);
    let unmatched = {} // unmatched letters for CORRECT word
    for (let i = 0; i < NUMBER_OF_LETTERS; i++) {
        let letter = rightGuess[i];

        if (letter === currentGuess[i]) {
            colors[i] = 'green'
        }
        else if (letter in unmatched) {
            unmatched[letter] += 1
        }
        else {
            unmatched[letter] = 1
        }
    }

    for (let i = 0; i < NUMBER_OF_LETTERS; i++) {
        let letter = currentGuess[i];
        // not a green tile
        if (letter !== rightGuess[i]){
            // letter is indeed in the word AND count greater than 0
            if (unmatched[letter]) {
                colors[i] = 'yellow'
                unmatched[letter] -= 1
            }
            else {
                colors[i] = 'grey'
            }

        }
    }

    for (let i = 0; i < NUMBER_OF_LETTERS; i++) {
        let letterColor = colors[i]
        let box = row.children[i]
        let letter = currentGuess[i]

        // old code that doesn't support double letters
        // let letterColor = ''
        // let box = row.children[i]
        // let letter = currentGuess[i]
        
        // let letterPosition = rightGuess.indexOf(currentGuess[i])
        // // is letter in the correct guess
        // if (letterPosition === -1) {
        //     letterColor = 'grey'
        // } else {
        //     // now, letter is definitely in word
        //     // if letter index and right guess index are the same
        //     // letter is in the right position 
        //     if (currentGuess[i] === rightGuess[i]) {
        //         // shade green 
        //         letterColor = 'green'
        //     } else {
        //         // check if the letter exists elsewhere
        //         // shade box yellow
        //         letterColor = 'yellow'
        //     }

        //     rightGuess[letterPosition] = "#"
        // }

        // put this in a different loop to do once you have all the answers
        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Refresh the page to keep going")
            // toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function insertLetter (pressedKey) {
    if (nextLetter === NUMBER_OF_LETTERS) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

initBoard();