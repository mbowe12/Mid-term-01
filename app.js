const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const cards = ref([
      { id: 1, content: 'Card 1' },
      { id: 2, content: 'Card 2' },
      { id: 3, content: 'Card 3' },
      { id: 4, content: 'Card 4' },
      { id: 5, content: 'Card 5' },
      { id: 6, content: 'Card 6' },
      { id: 7, content: 'Card 7' },
      { id: 8, content: 'Card 8' },
    ]);

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
    const currentCard = computed(() => cards.value[currentCardIndex.value]);
    const isLastCard = computed(() => currentCardIndex.value === cards.value.length - 1);

    function readFortune() {
      if (acceptedCards.value.length < 3) return "Not enough cards accepted.";
      const key = acceptedCards.value.slice(-3).map(card => card.id).sort((a, b) => a - b).join('-');
      return fortunes.value[key] || "No fortune found for these cards.";
    }

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
        showFortune.value = true; // Show fortune immediately
        return; // Stop further processing
      }

      setTimeout(() => {
        nextCard();
      }, 500); // Wait for fade out before moving to next card
    }

    function rejectCard(target) {
      target.style.transition = 'opacity 0.5s ease';
      target.style.opacity = '0'; // Fade out
      setTimeout(() => {
        nextCard();
      }, 500); // Wait for fade out before moving to next card
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
        target.style.opacity = '1'; // Reset opacity
        target.style.backgroundColor = ''; // Reset color
      }
    }

    function restartGame() {
      acceptedCards.value = [];
      showFortune.value = false;
      currentCardIndex.value = 0;
      shuffle(cards.value); // Shuffle cards again
    }

    return {
      cards,
      acceptedCards,
      currentCardIndex,
      showFortune,
      readFortune,
      setupInteract,
      restartGame,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.setupInteract();
    });
  },
});

app.mount('#app');
