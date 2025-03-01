document.addEventListener('DOMContentLoaded', () => {
    const startTime = 10;

    const controlsContainer = document.getElementById('controls-container');
    const startButton = document.getElementById('start-button');
    const exerciseDiv = document.getElementById('exercise');
    const notationDiv = document.getElementById('notation');
    const scoreDiv = document.getElementById('score');
    const timerContainer = document.getElementById('timer-container');
    const timerBar = document.getElementById('timer-bar');
    const correctCountSpan = document.getElementById('correct-count');
    const totalCountSpan = document.getElementById('total-count');
    const feedbackDiv = document.getElementById('feedback');
    const choicesDiv = document.getElementById('choices');
    const modeDisplayDiv = document.getElementById('mode-display');

    let correctCount = 0;
    let incorrectCount = 0;
    let timeLeft = 0;
    let timer;
    let currentKeySignature;
    let previousKeySignature = null;
    let showingFeedback = false;
    let activeKeySignatures = []; // Will store the currently active set of key signatures

    // Hide exercise, score, and timer initially
    exerciseDiv.classList.add('hidden');
    scoreDiv.classList.add('hidden');
    timerContainer.classList.add('hidden');

    // Define both major and minor key signatures
    const keySignatures = [
        // Major keys
        { name: 'C major', key: 'C', mode: 'major', accidental: 'no accidentals' },
        { name: 'G major', key: 'G', mode: 'major', accidental: '1 sharp' },
        { name: 'D major', key: 'D', mode: 'major', accidental: '2 sharps' },
        { name: 'A major', key: 'A', mode: 'major', accidental: '3 sharps' },
        { name: 'E major', key: 'E', mode: 'major', accidental: '4 sharps' },
        { name: 'B major', key: 'B', mode: 'major', accidental: '5 sharps' },
        { name: 'F# major', key: 'F#', mode: 'major', accidental: '6 sharps' },
        { name: 'C# major', key: 'C#', mode: 'major', accidental: '7 sharps' },
        { name: 'F major', key: 'F', mode: 'major', accidental: '1 flat' },
        { name: 'B♭ major', key: 'Bb', mode: 'major', accidental: '2 flats' },
        { name: 'E♭ major', key: 'Eb', mode: 'major', accidental: '3 flats' },
        { name: 'A♭ major', key: 'Ab', mode: 'major', accidental: '4 flats' },
        { name: 'D♭ major', key: 'Db', mode: 'major', accidental: '5 flats' },
        { name: 'G♭ major', key: 'Gb', mode: 'major', accidental: '6 flats' },
        { name: 'C♭ major', key: 'Cb', mode: 'major', accidental: '7 flats' },

        // Minor keys
        { name: 'A minor', key: 'Am', mode: 'minor', accidental: 'no accidentals' },
        { name: 'E minor', key: 'Em', mode: 'minor', accidental: '1 sharp' },
        { name: 'B minor', key: 'Bm', mode: 'minor', accidental: '2 sharps' },
        { name: 'F# minor', key: 'F#m', mode: 'minor', accidental: '3 sharps' },
        { name: 'C# minor', key: 'C#m', mode: 'minor', accidental: '4 sharps' },
        { name: 'G# minor', key: 'G#m', mode: 'minor', accidental: '5 sharps' },
        { name: 'D# minor', key: 'D#m', mode: 'minor', accidental: '6 sharps' },
        { name: 'A# minor', key: 'A#m', mode: 'minor', accidental: '7 sharps' },
        { name: 'D minor', key: 'Dm', mode: 'minor', accidental: '1 flat' },
        { name: 'G minor', key: 'Gm', mode: 'minor', accidental: '2 flats' },
        { name: 'C minor', key: 'Cm', mode: 'minor', accidental: '3 flats' },
        { name: 'F minor', key: 'Fm', mode: 'minor', accidental: '4 flats' },
        { name: 'B♭ minor', key: 'Bbm', mode: 'minor', accidental: '5 flats' },
        { name: 'E♭ minor', key: 'Ebm', mode: 'minor', accidental: '6 flats' },
        { name: 'A♭ minor', key: 'Abm', mode: 'minor', accidental: '7 flats' }
    ];

    // Define all possible key options for the buttons
    const allKeyOptions = [
        'C', 'C♭', 'C#', 'D', 'D♭', 'D#',
        'E', 'E♭', 'F', 'F#', 'G', 'G♭',
        'G#', 'A', 'A#', 'A♭', 'B', 'B♭'
    ];

    // Store the click handler so we can remove it later
    let choicesClickHandler;

    function startExercise() {
        correctCount = 0;
        incorrectCount = 0;
        timeLeft = startTime;
        correctCountSpan.textContent = correctCount;
        totalCountSpan.textContent = correctCount + incorrectCount;
        
        // Reset the feedback state
        showingFeedback = false;

        // Determine which mode is selected
        let selectedMode = 'major'; // Default
        document.querySelectorAll('input[name="key-mode"]').forEach(radio => {
            if (radio.checked) {
                selectedMode = radio.value;
            }
        });

        // Filter key signatures based on selected mode
        if (selectedMode === 'major') {
            activeKeySignatures = keySignatures.filter(ks => ks.mode === 'major');
        } else if (selectedMode === 'minor') {
            activeKeySignatures = keySignatures.filter(ks => ks.mode === 'minor');
        } else {
            // Both modes
            activeKeySignatures = keySignatures;
        }

        // Reset previousKeySignature when starting a new exercise
        previousKeySignature = null;

        // Reset timer bar to full width without animation
        timerBar.style.transition = 'none'; // Disable transition
        timerBar.style.width = '100%';

        // Force a reflow to apply the changes immediately
        void timerBar.offsetWidth;

        // Re-enable transition for subsequent updates
        timerBar.style.transition = 'width 1s linear';

        // Hide the controls container instead of just the start button
        controlsContainer.style.display = 'none'; // Use direct style instead of class

        // Show exercise, score, and timer
        exerciseDiv.classList.remove('hidden');
        scoreDiv.classList.remove('hidden');
        timerContainer.classList.remove('hidden');

        // Clear and show choices div
        choicesDiv.innerHTML = '';
        choicesDiv.classList.remove('hidden');
        
        // Remove previous event listener if it exists
        if (choicesClickHandler) {
            choicesDiv.removeEventListener('click', choicesClickHandler);
        }

        // Create choice buttons for all possible keys
        allKeyOptions.forEach(keyName => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = keyName;
            choicesDiv.appendChild(button);
        });

        // Create new click handler and store reference
        choicesClickHandler = (event) => {
            if (event.target.classList.contains('choice-button')) {
                checkAnswer(event.target.textContent, currentKeySignature.name);
            }
        };
        
        // Add the event listener using the stored reference
        choicesDiv.addEventListener('click', choicesClickHandler);

        // Initialize the feedback div for the new exercise
        feedbackDiv.innerHTML = '&nbsp;'; // Non-breaking space to take up height
        feedbackDiv.className = ''; // Remove any previous styling classes
        feedbackDiv.classList.remove('hidden'); // Make sure it's visible

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
        // Show the controls container again
        controlsContainer.style.display = ''; // Reset to default display
        
        // Hide the exercise elements
        notationDiv.innerHTML = ''; // Clear the key signature
        feedbackDiv.classList.add('hidden');
        scoreDiv.classList.add('hidden');
        modeDisplayDiv.classList.add('hidden');
        
        // Clear and hide the choices div
        choicesDiv.innerHTML = '';
        choicesDiv.classList.add('hidden');

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
        
        // Update mode display
        modeDisplayDiv.textContent = keySignature.mode === 'major' ? 'Major' : 'Minor';
        modeDisplayDiv.classList.remove('hidden');

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
            randomIndex = Math.floor(Math.random() * activeKeySignatures.length);
        } while (
            previousKeySignature && activeKeySignatures[randomIndex].key === previousKeySignature.key
        );

        currentKeySignature = activeKeySignatures[randomIndex];
        previousKeySignature = currentKeySignature;

        // Only clear feedback when explicitly calling this function from startExercise
        if (!showingFeedback) {
            // Reset the feedback element to empty state but keep space reserved
            feedbackDiv.innerHTML = '&nbsp;'; // Non-breaking space to take up height
            feedbackDiv.className = ''; // Remove any previous styling classes
        }

        // Render the key signature using VexFlow
        renderKeySignature(currentKeySignature);
    }

    function checkAnswer(selected, correct) {
        // Extract the root note from the key signature name
        const rootNote = correct.split(' ')[0]; // Gets "A" from "A major" or "A minor"
        
        if (selected === rootNote) {
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
