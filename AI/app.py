from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import google.generativeai as genai

genai.configure(api_key="AIzaSyAkfkONzGtNSv1x6q3F5JUnOpX7B1ttFC0")

# Load the model
model = genai.GenerativeModel("gemini-1.5-pro")

# Create Flask app
app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:8080"])

@app.route('/ask-tutor', methods=['POST'])
def ask_tutor():
    data = request.json
    user_question = data.get('question', '')

    if not user_question:
        return jsonify({'error': 'Question is required'}), 400

    # Generate tutor response
    try:
        response = model.generate_content(
            f"You are a helpful tutor for Grade 10–12 STEM students. Answer this simply and clearly:\n\n{user_question}"
        )
        return jsonify({'answer': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)

