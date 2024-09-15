from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
from flask_pymongo import PyMongo # type: ignore
from bson.objectid import ObjectId # type: ignore
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection string (replace with your URI)
app.config["MONGO_URI"] = "mongodb+srv://harshit:dWVR8m5M4ytHYzgF@cluster0.xknwq.mongodb.net/"

# Initialize PyMongo
mongo = PyMongo(app)

# Set up Gemini API key (Use environment variable for security)
genai.configure(api_key="AIzaSyAMttgd1TbM-6Ourlu-rKjZClcncbpG0NA")

# Initialize the Generative Model
model = genai.GenerativeModel("gemini-1.5-flash")

# Sample data for fruits
fruits = {
  "apple": {
    "name": "Apple",
    "description": "A crisp, sweet fruit, often red or green.",
    "image": "images/apple.jpg"
  },
  "orange": {
    "name": "Orange",
    "description": "A juicy, tangy fruit with a bright orange skin.",
    "image": "images/orange.jpg"
  },
  "grape": {
    "name": "Grape",
    "description": "Small, round fruit that can be red, green, or purple.",
    "image": "images/grape.jpg"
  },
  "pineapple": {
    "name": "Pineapple",
    "description": "A tropical fruit with a tough, spiky exterior and sweet, juicy interior.",
    "image": "images/pineapple.jpg"
  },
  "strawberry": {
    "name": "Strawberry",
    "description": "A red, juicy fruit with tiny seeds on its surface.",
    "image": "images/strawberry.jpg"
  },
  "kiwi": {
    "name": "Kiwi",
    "description": "A small, brown, fuzzy fruit with green flesh and tiny black seeds.",
    "image": "images/kiwi.jpg"
  },
  "mango": {
    "name": "Mango",
    "description": "A tropical fruit with a sweet, juicy flesh and a large pit.",
    "image": "images/mango.jpg"
  },
  "blueberry": {
    "name": "Blueberry",
    "description": "Small, round berries that are blue to purple in color and very sweet.",
    "image": "images/blueberry.jpg"
  },
  "peach": {
    "name": "Peach",
    "description": "A juicy fruit with a fuzzy skin and a large pit, typically yellow or red.",
    "image": "images/peach.jpg"
  },
  "watermelon": {
    "name": "Watermelon",
    "description": "A large, green fruit with a sweet, juicy, red interior and black seeds.",
    "image": "images/watermelon.jpg"
  },
  "pear": {
    "name": "Pear",
    "description": "A sweet fruit with a rounded base and a tapering top.",
    "image": "images/pear.jpg"
  },
  "cherry": {
    "name": "Cherry",
    "description": "A small, round fruit that is typically red or black and very sweet.",
    "image": "images/cherry.jpg"
  },
  "plum": {
    "name": "Plum",
    "description": "A round fruit with a smooth skin that can be red, purple, or yellow, and a tart flavor.",
    "image": "images/plum.jpg"
  },
  "banana": {
    "name": "Banana",
    "description": "A long, curved fruit with a yellow skin and soft, sweet flesh.",
    "image": "images/banana.jpg"
    }
}



# Define routes
@app.route('/')
def index():
    return "Welcome to my app"

# GET all FAQs
@app.route('/faqs', methods=['GET'])
def get_faqs():
    faqs = mongo.db.faqs.find()
    result = []
    for faq in faqs:
        result.append({
            'id': str(faq['_id']),
            'title': faq['title'],
            'description': faq['description'],
            'image': faq.get('image'),
            'altText': faq.get('altText')
        })
    return jsonify(result)

# GET a single FAQ
@app.route('/faqs/<id>', methods=['GET'])
def get_faq(id):
    faq = mongo.db.faqs.find_one({'_id': ObjectId(id)})
    if faq:
        return jsonify({
            'id': str(faq['_id']),
            'title': faq['title'],
            'description': faq['description'],
            'image': faq.get('image'),
            'altText': faq.get('altText')
        })
    else:
        return jsonify({'error': 'FAQ not found'}), 404

# POST a new FAQ
@app.route('/faqs', methods=['POST'])
def add_faq():
    data = request.get_json()
    result = mongo.db.faqs.insert_one({
        'title': data.get('title'),
        'description': data.get('description'),
        'image': data.get('image'),
        'altText': data.get('altText')
    })
    return jsonify({'id': str(result.inserted_id)}), 201

# PUT (Update) an existing FAQ
@app.route('/faqs/<id>', methods=['PUT'])
def update_faq(id):
    data = request.get_json()
    result = mongo.db.faqs.update_one(
        {'_id': ObjectId(id)},
        {'$set': {
            'title': data.get('title'),
            'description': data.get('description'),
            'image': data.get('image'),
            'altText': data.get('altText')
        }}
    )
    if result.matched_count:
        return jsonify({'message': 'FAQ updated successfully'})
    else:
        return jsonify({'error': 'FAQ not found'}), 404

# DELETE an FAQ
@app.route('/faqs/<id>', methods=['DELETE'])
def delete_faq(id):
    result = mongo.db.faqs.delete_one({'_id': ObjectId(id)})
    if result.deleted_count:
        return jsonify({'message': 'FAQ deleted successfully'})
    else:
        return jsonify({'error': 'FAQ not found'}), 404

# Global variable to store selected fruit
selected_fruit = None

@app.route('/fruits', methods=['GET'])
def get_fruits():
    return jsonify(fruits)

@app.route('/fruit/<fruit_name>', methods=['GET'])
def get_fruit(fruit_name):
    global selected_fruit
    fruit = fruits.get(fruit_name)

    if fruit:
        selected_fruit = fruit
        print(f"Selected fruit: {selected_fruit}")
        return jsonify(fruit)
    return jsonify({"error": "Fruit not found"}), 404

@app.route('/chat', methods=['POST'])
def gemini_chat():
    data = request.json
    message = data.get('message')
    selected_fruit_name = data.get('selectedFruit')
    history = data.get('history', [])  # Fetch history if available

    # If there is a message and either a selected fruit or history
    if message:
        # Check if a fruit is selected in the request
        if selected_fruit_name:
            selected_fruit = fruits.get(selected_fruit_name.lower())  # Get the fruit
            if selected_fruit:
                # If a new fruit is selected, prepend its info to the conversation history
                fruit_info = f"You selected {selected_fruit['name']}: {selected_fruit['description']}."
                history.append({"role": "system", "content": fruit_info})

        # Add the user's latest question to the history
        history.append({"role": "user", "content": message})

        try:
            # Build the conversation context by joining the historical messages
            conversation_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])

            # Generate response from the model
            response = model.generate_content(conversation_history)
            
            # Append the model's response to the history
            history.append({"role": "assistant", "content": response.text})

            return jsonify({"response": response.text, "updated_history": history})
        except Exception as e:
            print(f"Error in /chat route: {e}")
            return jsonify({"error": "Something went wrong!"}), 500

    return jsonify({"error": "No message received"}), 400


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port,debug=True)






