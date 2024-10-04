document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('intro-container');
    const typedElement = document.getElementById('typed-output');
    const startButton = document.getElementById('start-button');

    const messages = [
        "Hello... Welcome... You come seeking a fortune... Yes?",
        "behold the deck of Tarot. a most divine ritual...",
        "carefully affirm three cards with a swipe to the right... ☞ ",
        "and see what the fates decide."
    ];

    let currentMessageIndex = 0;
    const villagerSound = new Audio('assets/VillagerSpeech.mp3');

    function playVillagerSound() {
        villagerSound.play().catch(e => console.error('Error playing sound:', e));
    }

    function pauseVillagerSound() {
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
                onBegin: playVillagerSound,
                onComplete: (self) => {
                    pauseVillagerSound();
                    setTimeout(() => {
                        self.destroy();
                        currentMessageIndex++;
                        if (currentMessageIndex < messages.length) {
                            typeNextMessage();
                        } else {
                            showStartButton();
                        }
                    }, 1400);
                }
            });
        }
    }

    function showStartButton() {
        startButton.classList.add('visible');
        setTimeout(() => {
            startButton.style.opacity = '1';
        }, 50); // Small delay to ensure the transition works
        startButton.addEventListener('click', () => {
            introContainer.style.display = 'none';
            document.getElementById('app').style.display = 'flex';
            document.dispatchEvent(new Event('startCardGame'));
        });
    }

    typeNextMessage();
});