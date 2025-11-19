import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask } from '../features/tasks/taskSlice';
import { addEvent } from '../features/events/eventSlice';
import { selectCatagory } from '../features/catagories/catagorySlice';
import styles from './modules/AiPage.module.css';

function AiPage() {
    const dispatch = useDispatch();
    const categories = useSelector(selectCatagory);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    // Load chat history from localStorage
    const loadChatHistory = () => {
        try {
            const saved = localStorage.getItem('aiChatHistory');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    };

    const [messages, setMessages] = useState(loadChatHistory);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Save chat history to localStorage
    useEffect(() => {
        localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const addMessage = (text, isUser = true, data = null) => {
        const newMessage = {
            id: Date.now(),
            text,
            isUser,
            timestamp: new Date().toISOString(),
            data // Store AI response data for action buttons
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const inputText = userInput.trim();
        setUserInput('');
        addMessage(inputText, true);

        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:4000/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userInput: inputText })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Unknown server error');
            }

            const data = await res.json();

            if (data.recommendation) {
                addMessage(data.recommendation, false, data);
            } else if (data.error) {
                addMessage(`Error: ${data.error}`, false);
            } else {
                addMessage('Unexpected response format from the server.', false);
            }

        } catch (err) {
            addMessage(`Error: ${err.message}`, false);
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const extractTaskName = (userInput, recommendation) => {
        // Try to extract task name from user input or recommendation
        const patterns = [
            /(?:add|schedule|book|set up)\s+(?:a\s+)?(.+?)(?:\s+(?:for|to|at|on)\s+|$)/i,
            /(?:I need to|I want to|I should|I must)\s+(?:call|meet|do|complete|finish|prepare|schedule|have)\s+(?:a\s+)?(?:doctor'?s\s+)?(.+?)(?:\s+(?:tomorrow|today|at|on)|$)/i,
            /(?:call|meet|do|complete|finish|prepare|schedule|have)\s+(?:my\s+)?(.+?)(?:\s+(?:tomorrow|today|at|on)|$)/i,
        ];
        
        for (const pattern of patterns) {
            const match = userInput.match(pattern) || recommendation?.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        // Fallback: use first few words of user input
        const words = userInput.split(' ').slice(0, 6).join(' ');
        return words || 'New Task';
    };

    const parseSuggestedTime = (suggestedTime) => {
        if (!suggestedTime) return null;
        try {
            // Parse ISO datetime string - handle both with and without seconds
            let dateStr = suggestedTime;
            if (!dateStr.includes('T')) {
                return null;
            }
            
            // Ensure we have seconds
            if (dateStr.match(/T\d{2}:\d{2}$/)) {
                dateStr += ':00';
            }
            
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateStr);
                return null;
            }
            
            // Return in format YYYY-MM-DDTHH:mm for datetime-local inputs
            return date.toISOString().slice(0, 16);
        } catch (err) {
            console.error('Error parsing date:', err, suggestedTime);
            return null;
        }
    };

    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return null;
        try {
            const start = new Date(startTime);
            const end = new Date(start.getTime() + durationMinutes * 60000);
            return end.toISOString().slice(0, 16);
        } catch {
            return null;
        }
    };

    const handleAddTask = async (messageData, messageId) => {
        if (!messageData) return;
        
        setIsAdding(true);

        try {
            const taskName = extractTaskName('', messageData.recommendation);
            const suggestedTime = parseSuggestedTime(messageData.suggested_time);
            const defaultCategory = categories.length > 0 ? categories[0].id : null;

            const newTask = {
                name: taskName,
                description: `Added via AI: ${messageData.recommendation}`,
                due_date: suggestedTime,
                status: 'Not Started',
                urgency: 2,
                category_id: defaultCategory
            };

            const response = await fetch('http://localhost:4000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newTask),
            });

            if (!response.ok) throw new Error('Failed to create task');
            
            const data = await response.json();
            const category = categories.find(cat => cat.id === data.category_id) || categories[0];

            dispatch(addTask({
                id: data.id,
                taskName: data.name,
                description: data.description,
                dateTime: data.due_date,
                urgency: data.urgency,
                category_id: data.category_id,
                categoryName: category?.name || 'Uncategorized',
                categoryColor: category?.color || '#808080'
            }));

            addMessage(`✓ ${data.name} successfully added as a task!`, false);
            if (messageId) {
                setMessages(prev => prev.map(msg => 
                    msg.id === messageId ? { ...msg, actionTaken: true } : msg
                ));
            }

        } catch (err) {
            addMessage(`Failed to add task: ${err.message}`, false);
            console.error('Failed to add task:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleAddEvent = async (messageData, messageId) => {
        if (!messageData) return;
        
        setIsAdding(true);

        try {
            const eventName = extractTaskName('', messageData.recommendation);
            const suggestedTime = parseSuggestedTime(messageData.suggested_time);
            const durationMinutes = messageData.suggested_duration || 60;
            const startTime = suggestedTime || new Date().toISOString().slice(0, 16);
            const endTime = calculateEndTime(startTime, durationMinutes) || 
                          new Date(new Date(startTime).getTime() + 60 * 60000).toISOString().slice(0, 16);
            const defaultCategory = categories.length > 0 ? categories[0].id : null;

            const newEvent = {
                name: eventName,
                description: `Added via AI: ${messageData.recommendation}`,
                start_time: startTime,
                end_time: endTime,
                category_id: defaultCategory,
                status: 'Not Completed'
            };

            const response = await fetch('http://localhost:4000/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newEvent)
            });

            if (!response.ok) throw new Error('Failed to create event');
            
            const data = await response.json();
            const category = categories.find(cat => cat.id === data.category_id) || categories[0];

            dispatch(addEvent({
                eventName: data.name,
                startTime: data.start_time,
                endTime: data.end_time,
                description: data.description,
                category_id: data.category_id,
                category_name: category?.name || 'Uncategorized',
                category_color: category?.color || '#808080'
            }));

            addMessage(`✓ ${data.name} successfully added as an event!`, false);
            if (messageId) {
                setMessages(prev => prev.map(msg => 
                    msg.id === messageId ? { ...msg, actionTaken: true } : msg
                ));
            }

        } catch (err) {
            addMessage(`Failed to add event: ${err.message}`, false);
            console.error('Failed to add event:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const shouldShowAddButtons = (message) => {
        if (!message.data || message.actionTaken) return false;
        const rec = message.data.recommendation?.toLowerCase() || '';
        return rec.includes('would you like me to add') || 
               rec.includes('should i add') ||
               rec.includes('add it') ||
               rec.includes('schedule it');
    };

    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the chat history?')) {
            setMessages([]);
            localStorage.removeItem('aiChatHistory');
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <h1>AI Scheduling Assistant</h1>
                <button onClick={clearChat} className={styles.clearButton}>
                    Clear Chat
                </button>
            </div>

            <div className={styles.messagesContainer}>
                {messages.length === 0 && (
                    <div className={styles.welcomeMessage}>
                        <p>👋 Hi! I'm your AI scheduling assistant.</p>
                        <p>I can help you schedule tasks and events. Try asking:</p>
                        <ul>
                            <li>"I need to call my boss tomorrow at 3 PM"</li>
                            <li>"Schedule a doctor's appointment for tomorrow at 1 PM"</li>
                            <li>"When should I do my laundry?"</li>
                        </ul>
                    </div>
                )}
                
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
                    >
                        <div className={styles.messageContent}>
                            <div className={styles.messageText}>
                                {message.text}
                            </div>
                            {!message.isUser && shouldShowAddButtons(message) && (
                                <div className={styles.actionButtons}>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleAddTask(message.data, message.id)}
                                        disabled={isAdding || message.actionTaken}
                                    >
                                        {isAdding ? 'Adding...' : 'Add as Task'}
                                    </button>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleAddEvent(message.data, message.id)}
                                        disabled={isAdding || message.actionTaken}
                                    >
                                        {isAdding ? 'Adding...' : 'Add as Event'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={styles.messageTime}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className={`${styles.message} ${styles.aiMessage}`}>
                        <div className={styles.messageContent}>
                            <div className={styles.typingIndicator}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputContainer} onSubmit={handleSend}>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.chatInput}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={isLoading || !userInput.trim()}
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default AiPage;
