// --- Element References ---
const trainingForm = document.getElementById('training-form');
const generateButton = document.getElementById('generate-button');
const planContainer = document.getElementById('training-plan-container');

// --- Event Listener ---
trainingForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    handleFormSubmit();
});

// --- Main Handler Function ---
async function handleFormSubmit() {
    const currentRole = document.getElementById('current-role').value;
    const careerGoal = document.getElementById('career-goal').value;

    if (!currentRole || !careerGoal) {
        alert('Please fill out both fields.');
        return;
    }

    // Show a loading state
    planContainer.innerHTML = '<div class="loading-spinner"></div>';
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    // Construct the prompt for the AI
    const userPrompt = `I am a cyber operator with the current role of '${currentRole}'. My goal is to '${careerGoal}'. Please generate a step-by-step training plan for me. The output should be a JSON array of objects, where each object has 'step_number', 'title', 'justification', and 'url'.`;
    
    try {
        // Call the backend API
        const aiResponse = await getAIResponse(userPrompt);
        
        // Render the response
        renderTrainingPlan(aiResponse);

    } catch (error) {
        // Handle errors
        planContainer.innerHTML = `<p class="placeholder-text">An error occurred while generating your plan. The AI service may be offline. Please try again later.</p>`;
        console.error("Error:", error);
    } finally {
        // Reset the button state
        generateButton.disabled = false;
        generateButton.textContent = 'Generate My Path';
    }
}

// --- API Communication Function ---
async function getAIResponse(prompt) {
    // IMPORTANT: Replace this with the real API URL from your Hugging Face Space
    const API_URL = "https://YourUsername-YourSpaceName.hf.space/run/predict"; 

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: [prompt]
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    // The AI's response is often a string of JSON. We need to parse it.
    // In a real app, you'd add more robust error handling for this parse.
    return JSON.parse(result.data[0]);
}

// --- UI Rendering Function ---
function renderTrainingPlan(planData) {
    // Clear the loading spinner
    planContainer.innerHTML = '';

    if (!planData || planData.length === 0) {
        planContainer.innerHTML = `<p class="placeholder-text">The AI was unable to generate a plan. Please try refining your goal.</p>`;
        return;
    }

    // Create and append each step of the plan
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
        link.target = '_blank'; // Open in a new tab

        stepElement.appendChild(title);
        stepElement.appendChild(justification);
        stepElement.appendChild(link);

        planContainer.appendChild(stepElement);
    });
}
