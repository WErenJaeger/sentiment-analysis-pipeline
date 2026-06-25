import json
import torch
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast

MODEL_PATH = "/var/task/model"
device = torch.device("cpu")

model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_PATH)
model.to(device)
model.eval()

label_map = {0: "negative", 1: "neutral", 2: "positive"}

def predict_sentiment(text):
    inputs = tokenizer(
        text, truncation=True, padding="max_length",
        max_length=128, return_tensors="pt"
    )
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        pred_idx = torch.argmax(probs, dim=1).item()
        confidence = probs[0][pred_idx].item()

    return {
        "sentiment": label_map[pred_idx],
        "confidence": round(confidence, 4)
    }

def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}")) if isinstance(event.get("body"), str) else event
        text = body.get("text", "")

        if not text:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No 'text' field provided"})
            }

        result = predict_sentiment(text)

        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
