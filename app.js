document.addEventListener('startCardGame', () => {
    const { createApp, ref, computed } = Vue;

    const app = createApp({
        setup() {
            const cards = ref([
                { id: 1, image: 'assets/card-1.png' },
                { id: 2, image: 'assets/card-2.png' },
                { id: 3, image: 'assets/card-3.png' },
                { id: 4, image: 'assets/card-4.png' },
                { id: 5, image: 'assets/card-5.png' },
                { id: 6, image: 'assets/card-6.png' },
                { id: 7, image: 'assets/card-7.png' },
                { id: 8, image: 'assets/card-8.png' },
            ]);

            const cardBackImage = 'assets/00-CardBack.png';

            // Shuffle function
            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            // Shuffle cards on setup
            shuffle(cards.value);

            const acceptedCards = ref([]);
            const showFortune = ref(false);
            const fortunes = ref({}); // To hold fortunes from JSON

            // Load fortunes from JSON
            fetch('fortunes.json')
                .then(response => response.json())
                .then(data => {
                    fortunes.value = data;
                });

            const currentCardIndex = ref(0);
            const currentCard = computed(() => ({
                ...cards.value[currentCardIndex.value],
                displayImage: cardBackImage
            }));
            const isLastCard = computed(() => currentCardIndex.value === cards.value.length - 1);

            function readFortune() {
                if (acceptedCards.value.length < 3) return "Not enough cards accepted.";
                const key = acceptedCards.value.slice(-3).map(card => card.id).sort((a, b) => a - b).join('-');
                return fortunes.value[key] || "No fortune found for these cards.";
            }

            function displayFortune() {
                const fortuneText = readFortune();
                const fortuneContainer = document.getElementById('fortune-display');
                fortuneContainer.innerHTML = `<div class="fortune-container"><div class="fortune-text">${fortuneText}</div></div>`;
            }

            const showChosenCards = computed(() => acceptedCards.value.slice(-3));

            function setupInteract() {
                interact('.card')
                    .draggable({
                        inertia: true,
                        listeners: {
                            move: dragMoveListener,
                            end: dragEndListener,
                        },
                    });
            }

            function dragMoveListener(event) {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);

                const rotation = x / 10;
                target.style.transform += ` rotate(${rotation}deg)`;

                if (x > 150) {
                    target.style.backgroundColor = 'rgba(76, 175, 80, 0.5)'; // Green for acceptance
                } else if (x < -150) {
                    target.style.backgroundColor = 'rgba(244, 67, 54, 0.5)'; // Red for rejection
                } else {
                    target.style.backgroundColor = ''; // Reset color
                }
            }

            function dragEndListener(event) {
                const target = event.target;
                const x = parseFloat(target.getAttribute('data-x')) || 0;

                if (x > 150) {
                    acceptCard(target);
                } else if (x < -150) {
                    rejectCard(target);
                } else {
                    resetCardPosition(target);
                }
            }

            function acceptCard(target) {
                acceptedCards.value.push(currentCard.value);
                target.style.transition = 'opacity 0.5s ease';
                target.style.opacity = '0'; // Fade out

                if (acceptedCards.value.length >= 3) {
                    showFortune.value = true; // show fortune immediately
                    return; // stop here
                }

                setTimeout(() => {
                    nextCard();
                }, 500); // wait for fade out before moving to next card
            }

            function rejectCard(target) {
                target.style.transition = 'opacity 0.5s ease';
                target.style.opacity = '0'; // Fade out
                setTimeout(() => {
                    nextCard();
                }, 500); // wait for fade out before moving to next card
            }

            function nextCard() {
                if (isLastCard.value) {
                    showFortune.value = true;
                } else {
                    currentCardIndex.value++;
                    resetCardPosition();
                }
            }

            function resetCardPosition(target) {
                if (target) {
                    target.style.transform = 'translate(0px, 0px) rotate(0deg)';
                    target.setAttribute('data-x', 0);
                    target.setAttribute('data-y', 0);
                    target.style.opacity = '1'; // reset opacity
                    target.style.backgroundColor = ''; // reset color
                }
            }

            function restartGame() {
                acceptedCards.value = [];
                showFortune.value = false;
                fortunes.value = {};
                currentCardIndex.value = 0;
                shuffle(cards.value); // shuffle cards again
            }

            return {
                cards,
                acceptedCards,
                currentCardIndex,
                showFortune,
                readFortune,
                setupInteract,
                restartGame,
                showChosenCards,
                cardBackImage,
                currentCard,
            };
        },
        mounted() {
            this.$nextTick(() => {
                this.setupInteract();
            });
        },
    });

    // Show the app container
    const appContainer = document.getElementById('app');
    appContainer.style.display = 'flex'; // Set display to flex

    app.mount('#app');
});
