document.addEventListener('DOMContentLoaded', () => {
    const startTime = 10;

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
    
    // Hide exercise, score, and timer initially
    exerciseDiv.classList.add('hidden');
    scoreDiv.classList.add('hidden');
    timerContainer.classList.add('hidden');
    
    // Define key signatures
    const keySignatures = [
        { name: 'C', key: 'C', mode: 'major' },
        { name: 'G', key: 'G', mode: 'major' },
        { name: 'D', key: 'D', mode: 'major' },
        { name: 'A', key: 'A', mode: 'major' },
        { name: 'E', key: 'E', mode: 'major' },
        { name: 'B', key: 'B', mode: 'major' },
        { name: 'F#', key: 'F#', mode: 'major' },
        { name: 'C#', key: 'C#', mode: 'major' },
        { name: 'F', key: 'F', mode: 'major' },
        { name: 'B♭', key: 'Bb', mode: 'major' },
        { name: 'E♭', key: 'Eb', mode: 'major' },
        { name: 'A♭im', key: 'Ab', mode: 'major' },
        { name: 'D♭', key: 'Db', mode: 'major' },
        { name: 'G♭', key: 'Gb', mode: 'major' },
        { name: 'C♭', key: 'Cb', mode: 'major' }
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
        
        // Create choice buttons once
        keySignatures.forEach(ks => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = ks.name;
            button.dataset.key = ks.key;  // Store the key for later reference
            choicesDiv.appendChild(button);
        });
        
        // Add the event listener to the container using event delegation
        choicesDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('choice-button')) {
                checkAnswer(event.target.textContent, currentKeySignature.name);
            }
        });
        
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
        
        // Configure the rendering context with increased dimensions
        renderer.resize(240, 150); // Increased height and width
        const context = renderer.getContext();
        context.setFont("Arial", 10);
        
        // Apply scaling to make everything bigger
        context.scale(1.3, 1.3); // Scale up by 30%
        
        // Create a stave (adjusted width to account for scaling)
        const stave = new VF.Stave(10, 0, 170);
        stave.addClef("treble");
        stave.addKeySignature(keySignature.key);
        
        // Draw the stave
        stave.setContext(context).draw();
    }

    function nextQuestion() {
        const randomIndex = Math.floor(Math.random() * keySignatures.length);
        currentKeySignature = keySignatures[randomIndex];
        
        // Render the key signature using VexFlow
        renderKeySignature(currentKeySignature);
    }

    function checkAnswer(selected, correct) {
        // Strip HTML to compare just the text
        const selectedClean = selected.replace(/\s+/g, '');
        const correctClean = correct.replace(/\s+/g, '').replace(/<[^>]*>/g, '');
        
        if (selectedClean === correctClean) {
            correctCount++;
            correctCountSpan.textContent = correctCount;
        } else {
            incorrectCount++;
        }
        totalCountSpan.textContent = correctCount + incorrectCount;
        
        nextQuestion();
    }

    startButton.addEventListener('click', startExercise);
});
