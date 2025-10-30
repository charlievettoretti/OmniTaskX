import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/', (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: 'User input is required' });
    }
    const aiScript = path.join(__dirname, '../ai/ai_agent_gem.py');

    const pythonProcess = spawn('python3', [aiScript, userInput]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const jsonResponse = JSON.parse(output);
                res.json(jsonResponse);
            } catch (err) {
                res.status(500).json({ 
                    error: 'Failed to parse AI response', 
                    raw: output,
                    details: err.message });
            }
        } else {
            res.status(500).json({ 
                error: 'AI script error', 
                details: errorOutput });
        }
    });
});

export default router;