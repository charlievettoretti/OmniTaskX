import React, { useState } from 'react';
import styles from './modules/AiPage.module.css'; // Correctly importing the CSS Module

function AiPage() {
    const [userInput, setUserInput] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAskAI = async () => {
        setIsLoading(true);
        setError(null);
        setAiResponse('');

        try {
            const res = await fetch('http://localhost:4000/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput })
            });

            // Check if the HTTP response was successful.
            if (!res.ok) {
                // If the server returns a non-200 status, read the error message.
                const errorData = await res.json();
                throw new Error(errorData.error || 'Unknown server error');
            }

            const data = await res.json();

            // The Python script returns a JSON object with a 'recommendation' key.
            // We'll display that to the user.
            if (data.recommendation) {
                setAiResponse(data.recommendation);
            } else if (data.error) {
                // Handle errors returned by the Python script.
                throw new Error(data.error);
            } else {
                // Handle unexpected response format.
                throw new Error('Unexpected response format from the server.');
            }

        } catch (err) {
            setError(err.message);
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.aiContainer}>
            <h1>AI Assistant</h1>
            <p>Ask the AI assistant for scheduling advice and recommendations.</p>
            <textarea
                className={styles.aiInputTextarea}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="E.g., What is a good time to do my laundry? When should I prepare for my exam?"
                rows="4"
            />
            <button 
                className={styles.aiButton}
                onClick={handleAskAI}
                disabled={isLoading || !userInput.trim()}
            >
                {isLoading ? 'Thinking...' : 'Ask AI'}
            </button>
            
            <div className={styles.aiResponseContainer}>
                <h2>AI's Recommendation:</h2>
                {isLoading && <p>Loading...</p>}
                {error && <p className={styles.aiErrorMessage}>Error: {error}</p>}
                {!isLoading && aiResponse && (
                    <div className={styles.aiResponseBox}>
                        <pre>{aiResponse}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AiPage;