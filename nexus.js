// --- Element References ---
const trainingForm = document.getElementById('training-form');
const generateButton = document.getElementById('generate-button');
const planContainer = document.getElementById('training-plan-container');

// --- Event Listener ---
trainingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleFormSubmit();
});

// --- Main Handler Function ---
async function handleFormSubmit() {
    const currentRole = document.getElementById('current-role').value.trim();
    const careerGoal = document.getElementById('career-goal').value.trim();

    if (!currentRole || !careerGoal) {
        alert('Please fill out both fields.');
        return;
    }

    planContainer.innerHTML = '<div class="loading-spinner"></div>';
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    // Keep the prompt factual and direct — the system prompt in Flask handles persona/format
    const userPrompt = `Current role: ${currentRole}\nCareer goal: ${careerGoal}`;

    try {
        const aiResponse = await getAIResponse(userPrompt);
        renderTrainingPlan(aiResponse);
    } catch (error) {
        planContainer.innerHTML = `<p class="placeholder-text">An error occurred while generating your plan. The AI service may be offline. Please try again later.</p>`;
        console.error("Error:", error);
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Generate My Path';
    }
}

// --- API Communication Function ---
async function getAIResponse(prompt) {
    const API_URL = "https://nexus-back-end-3eom.onrender.com/run/predict";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
}

// --- UI Rendering Function ---
function renderTrainingPlan(planData) {
    planContainer.innerHTML = '';

    if (!planData || planData.length === 0) {
        planContainer.innerHTML = `<p class="placeholder-text">The AI was unable to generate a plan. Please try refining your goal.</p>`;
        return;
    }

    planData.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.classList.add('training-step');
        stepElement.setAttribute('data-step', step.step_number);

        const title = document.createElement('h3');
        title.textContent = step.title;

        const justification = document.createElement('p');
        justification.textContent = step.justification;

        const link = document.createElement('a');
        link.href = step.url;
        link.textContent = 'Go to Resource';
        link.target = '_blank';
        link.rel = 'noopener noreferrer'; // Security best practice for target="_blank"

        stepElement.appendChild(title);
        stepElement.appendChild(justification);
        stepElement.appendChild(link);
        planContainer.appendChild(stepElement);
    });
}
