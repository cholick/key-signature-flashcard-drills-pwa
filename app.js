document.addEventListener('DOMContentLoaded', () => {
    const startTime = 300;

    const startButton = document.getElementById('start-button');
    const exerciseDiv = document.getElementById('exercise');
    const notationDiv = document.getElementById('notation');
    const scoreDiv = document.getElementById('score');
    const timerContainer = document.getElementById('timer-container');
    const timerBar = document.getElementById('timer-bar');
    const correctCountSpan = document.getElementById('correct-count');
    const totalCountSpan = document.getElementById('total-count');

    let correctCount = 0;
    let incorrectCount = 0;
    let timeLeft = 0;
    let timer;
    let currentKeySignature;
    let previousKeySignature = null;
    let showingFeedback = false;

    // Hide exercise, score, and timer initially
    exerciseDiv.classList.add('hidden');
    scoreDiv.classList.add('hidden');
    timerContainer.classList.add('hidden');

    // Define key signatures with accidental info - these are the only signatures that will be shown/tested
    const keySignatures = [
        { name: 'C', key: 'C', mode: 'major', accidental: 'no accidentals' },
        { name: 'G', key: 'G', mode: 'major', accidental: '1 sharp' },
        { name: 'D', key: 'D', mode: 'major', accidental: '2 sharps' },
        { name: 'A', key: 'A', mode: 'major', accidental: '3 sharps' },
        { name: 'E', key: 'E', mode: 'major', accidental: '4 sharps' },
        { name: 'B', key: 'B', mode: 'major', accidental: '5 sharps' },
        { name: 'F#', key: 'F#', mode: 'major', accidental: '6 sharps' },
        { name: 'C#', key: 'C#', mode: 'major', accidental: '7 sharps' },
        { name: 'F', key: 'F', mode: 'major', accidental: '1 flat' },
        { name: 'B♭', key: 'Bb', mode: 'major', accidental: '2 flats' },
        { name: 'E♭', key: 'Eb', mode: 'major', accidental: '3 flats' },
        { name: 'A♭', key: 'Ab', mode: 'major', accidental: '4 flats' },
        { name: 'D♭', key: 'Db', mode: 'major', accidental: '5 flats' },
        { name: 'G♭', key: 'Gb', mode: 'major', accidental: '6 flats' },
        { name: 'C♭', key: 'Cb', mode: 'major', accidental: '7 flats' }
    ];

    // Define all possible key options for the buttons
    const allKeyOptions = [
        'C', 'C♭', 'C#', 'D', 'D♭', 'D#',
        'E', 'E♭', 'F', 'F#', 'G', 'G♭',
        'G#', 'A', 'A#', 'A♭', 'B', 'B♭'
    ];

    function startExercise() {
        correctCount = 0;
        incorrectCount = 0;
        timeLeft = startTime;
        correctCountSpan.textContent = correctCount;
        totalCountSpan.textContent = correctCount + incorrectCount;

        // Reset timer bar to full width without animation
        timerBar.style.transition = 'none'; // Disable transition
        timerBar.style.width = '100%';

        // Force a reflow to apply the changes immediately
        void timerBar.offsetWidth;

        // Re-enable transition for subsequent updates
        timerBar.style.transition = 'width 1s linear';

        // Hide the start button instead of disabling it
        startButton.classList.add('hidden');

        // Show exercise, score, and timer
        exerciseDiv.classList.remove('hidden');
        scoreDiv.classList.remove('hidden');
        timerContainer.classList.remove('hidden');

        // Create the choices div once
        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices';
        exerciseDiv.appendChild(choicesDiv);

        // Create choice buttons for all possible keys
        allKeyOptions.forEach(keyName => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = keyName;
            choicesDiv.appendChild(button);
        });

        // Add the event listener to the container using event delegation
        choicesDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('choice-button')) {
                checkAnswer(event.target.textContent, currentKeySignature.name);
            }
        });

        // Create feedback element with initial empty state to reserve space
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'feedback';
        feedbackDiv.innerHTML = '&nbsp;'; // Non-breaking space to take up height
        exerciseDiv.insertBefore(feedbackDiv, exerciseDiv.firstChild);

        nextQuestion();
        timer = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        timeLeft--;

        // Update the timer bar width
        const percentageLeft = (timeLeft / startTime) * 100;
        timerBar.style.width = `${percentageLeft}%`;

        if (timeLeft <= 0) {
            clearInterval(timer);

            // Small delay to allow the timer bar animation to complete
            setTimeout(() => {
                endExercise();
            }, 1000);
        }
    }

    function endExercise() {
        // Show the start button again
        startButton.classList.remove('hidden');

        // Remove the choices when the exercise ends
        const choicesDiv = exerciseDiv.querySelector('.choices');
        if (choicesDiv) {
            exerciseDiv.removeChild(choicesDiv);
        }

        // Create and show the modal instead of alert
        showResultModal();
    }

    function showResultModal() {
        // Create the modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        // Create the modal
        const modal = document.createElement('div');
        modal.className = 'modal';

        // Create modal content
        const heading = document.createElement('h2');
        const percent = Math.round((correctCount / (correctCount + incorrectCount)) * 100);
        heading.textContent = `${percent}% Correct`;

        const resultText = document.createElement('p');
        resultText.textContent = `You got ${correctCount} out of ${correctCount + incorrectCount} correct.`;

        const closeButton = document.createElement('button');
        closeButton.className = 'modal-button';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        // Assemble the modal
        modal.appendChild(heading);
        modal.appendChild(resultText);
        modal.appendChild(closeButton);
        modalOverlay.appendChild(modal);

        // Add the modal to the page
        document.body.appendChild(modalOverlay);
    }

    function renderKeySignature(keySignature) {
        // Clear the notation div
        notationDiv.innerHTML = '';

        // Create a VexFlow renderer
        const VF = Vex.Flow;
        const renderer = new VF.Renderer(notationDiv, VF.Renderer.Backends.SVG);

        // Configure the rendering context with optimized dimensions
        renderer.resize(300, 150); // Reduced height to decrease white space

        const context = renderer.getContext();
        context.setFont("Arial", 10);

        // Apply scaling to make everything bigger
        context.scale(1.6, 1.6); // Scale up by 60%

        const stave = new VF.Stave(10, -15, 170); // Negative y value moves it up
        stave.addClef("treble");
        stave.addKeySignature(keySignature.key);

        // Draw the stave
        stave.setContext(context).draw();
    }

    function nextQuestion() {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * keySignatures.length);
        } while (
            // Keep trying until we get a different key signature than before
            previousKeySignature && keySignatures[randomIndex].key === previousKeySignature.key
        );

        currentKeySignature = keySignatures[randomIndex];
        previousKeySignature = currentKeySignature;

        // Only clear feedback when explicitly calling this function from startExercise
        if (!showingFeedback) {
            // Reset the feedback element to empty state but keep space reserved
            const feedbackDiv = document.getElementById('feedback');
            if (feedbackDiv) {
                feedbackDiv.innerHTML = '&nbsp;'; // Non-breaking space to take up height
                feedbackDiv.className = ''; // Remove any previous styling classes
            }
        }

        // Render the key signature using VexFlow
        renderKeySignature(currentKeySignature);
    }

    function checkAnswer(selected, correct) {
        // Strip HTML to compare just the text
        const selectedClean = selected.replace(/\s+/g, '');
        const correctClean = correct.replace(/\s+/g, '').replace(/<[^>]*>/g, '');

        // Get the feedback element
        const feedbackDiv = document.getElementById('feedback');

        if (selectedClean === correctClean) {
            correctCount++;
            correctCountSpan.textContent = correctCount;

            // Show correct feedback with the key signature info
            feedbackDiv.textContent = `Correct! ${currentKeySignature.name} is ${currentKeySignature.accidental}`;
            feedbackDiv.className = 'correct';
        } else {
            incorrectCount++;

            // Show incorrect feedback with the correct answer and user's answer
            feedbackDiv.textContent = `Incorrect: ${currentKeySignature.accidental} is ${currentKeySignature.name}. You answered ${selected}`;
            feedbackDiv.className = 'incorrect';
        }

        totalCountSpan.textContent = correctCount + incorrectCount;

        // Set the flag that we're showing feedback
        showingFeedback = true;

        nextQuestion();
    }

    startButton.addEventListener('click', startExercise);
});
