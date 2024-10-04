document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('intro-container');
    introContainer.classList.add('intro-container');

    // add background image
    const backgroundImage = document.createElement('img');
    backgroundImage.src = 'assets/Intro-Image.gif';
    backgroundImage.classList.add('background-image');
    introContainer.appendChild(backgroundImage);

    const typedElement = document.createElement('div');
    typedElement.id = 'typed-output';
    typedElement.classList.add('typed-text-box');
    introContainer.appendChild(typedElement);

    const messages = [
        "Hello... Welcome... You come seeking a fortune... Yes?",
        "behold the deck of Tarot. a most divine ritual...",
        "carefully affirm three cards with a swipe to the right... ☞ ",
        "and see what the fates decide."
    ];

    let currentMessageIndex = 0;
    const villagerSound = new Audio('assets/VillagerSpeech.mp3');

    function playVillagerSound() {
        villagerSound.play();
        console.log('Attempting to play sound');
        villagerSound.currentTime = 0;
        villagerSound.play().catch(e => console.error('Error playing sound:', e));
    }

    function pauseVillagerSound() {
        console.log('Pausing sound');
        villagerSound.pause();
    }

    function typeNextMessage() {
        if (currentMessageIndex < messages.length) {
            new Typed('#typed-output', {
                strings: [messages[currentMessageIndex]],
                typeSpeed: 50,
                backSpeed: 60,
                fadeOut: true,
                showCursor: false,
                onBegin: (self) => {
                    playVillagerSound();
                },
                onComplete: (self) => {
                    pauseVillagerSound();
                    setTimeout(() => {
                        self.destroy();
                        currentMessageIndex++;
                        typeNextMessage();
                    }, 1400);
                }
            });
        } else {
            showStartButton();
        }
    }

    function showStartButton() {
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Drawing Cards';
        startButton.classList.add('button', 'mt-3');
        startButton.addEventListener('click', () => {
            introContainer.style.display = 'none';
            document.getElementById('app').style.display = 'block';
            document.dispatchEvent(new Event('startCardGame'));
        });
        introContainer.appendChild(startButton);
    }

    typeNextMessage();
});