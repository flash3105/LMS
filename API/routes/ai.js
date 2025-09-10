const express = require('express');
const https = require('https');
const router = express.Router();

router.post('/ask', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        if (!userPrompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Use the correct model name: gemini-2.0-flash
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
        };

        const requestData = JSON.stringify({
            contents: [{
                parts: [{
                    text: userPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        console.log('Making request to Gemini API with model: gemini-2.0-flash');

        const apiReq = https.request(options, (apiRes) => {
            let responseData = '';

            apiRes.on('data', (chunk) => {
                responseData += chunk;
            });

            apiRes.on('end', () => {
                try {
                    console.log('Gemini API Response:', responseData);
                    const parsedResponse = JSON.parse(responseData);
                    
                    if (parsedResponse.error) {
                        console.error('Gemini API Error:', parsedResponse.error);
                        return res.status(500).json({ 
                            error: `Gemini API Error: ${parsedResponse.error.message}` 
                        });
                    }

                    let replyText = "No response from Gemini.";
                    
                    if (parsedResponse.candidates && parsedResponse.candidates[0]) {
                        const candidate = parsedResponse.candidates[0];
                        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                            replyText = candidate.content.parts[0].text;
                        }
                    }

                    res.json({ reply: replyText });

                } catch (err) {
                    console.error('Error parsing AI response:', err);
                    res.status(500).json({ error: 'Failed to parse AI response' });
                }
            });
        });

        apiReq.on('error', (e) => {
            console.error('Gemini API request failed:', e);
            res.status(500).json({ error: 'Failed to connect to Gemini API' });
        });

        apiReq.write(requestData);
        apiReq.end();

    } catch (error) {
        console.error('Unexpected error in /ask endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
