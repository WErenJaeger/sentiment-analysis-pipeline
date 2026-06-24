# Sentiment Analysis & Anomaly Detection Pipeline

End-to-end NLP pipeline that fine-tunes DistilBERT for sentiment classification on Amazon product reviews, with weekly trend analysis and statistical anomaly detection.

## Project Overview

This project extends a previous serverless ETL pipeline (Java/AWS Lambda/Supabase/React) by adding a full NLP model training and inference layer. It demonstrates:

- Fine-tuning a transformer model (DistilBERT) for 3-class sentiment classification
- Handling class imbalance via undersampling
- Time-series anomaly detection on sentiment trends
- (Planned) Model serving via AWS Lambda and a React dashboard

## Dataset

[Amazon Fine Food Reviews](https://www.kaggle.com/datasets/snap/amazon-fine-food-reviews) (CC0-1.0 license), 568,454 reviews spanning 1999-2012.

To download:
```bash
kaggle datasets download -d snap/amazon-fine-food-reviews
unzip amazon-fine-food-reviews.zip
```

## Methodology

1. **Label creation**: Star ratings mapped to sentiment classes (1-2: negative, 3: neutral, 4-5: positive)
2. **Class balancing**: Undersampled to 40,000 examples per class (120,000 total) to address the original 64% positive-class skew
3. **Fine-tuning**: DistilBERT (`distilbert-base-uncased`), 3 epochs, max sequence length 128 (selected based on the 95th percentile token length of 134)
4. **Evaluation**: Best checkpoint selected via validation F1 score

## Results

| Metric | Test Set |
|---|---|
| Accuracy | 84% |
| F1 (weighted) | 84% |

Per-class breakdown showed the "neutral" class as the primary source of confusion (F1: 0.78 vs 0.84-0.88 for negative/positive), consistent with the inherent ambiguity of neutral sentiment expression in natural language.

## Tech Stack

- **ML**: PyTorch, Hugging Face Transformers, scikit-learn
- **Experiment tracking**: MLflow
- **Infra (planned)**: AWS Lambda, Supabase (PostgreSQL), React/Recharts

## Project Status

- [x] Data acquisition and preprocessing
- [x] Model fine-tuning and evaluation
- [ ] Weekly sentiment trend analysis
- [ ] Statistical anomaly detection (IQR-based)
- [ ] Model serving (AWS Lambda)
- [ ] Interactive dashboard (React/Recharts)

## Author

[GitHub - WErenJaeger](https://github.com/WErenJaeger)
