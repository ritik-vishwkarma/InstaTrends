print("Just started")

import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer

# Try a larger FLAN-T5 model for better performance
model_name = "google/flan-t5-base"  # Use large instead of base
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
print(f"Loading model: {model_name}")

tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name).to(device)

# For FLAN-T5, specific instruction format works better
prompt = "Translate the following English sentence to Hindi: How are you?"
print(f"\nPrompt: '{prompt}'")

# Tokenize with padding
encoding = tokenizer(prompt, padding="longest", return_tensors="pt").to(device)
print(f"Tokenized input length: {encoding.input_ids.shape[1]}")

# Generate translation
outputs = model.generate(
    encoding.input_ids,
    attention_mask=encoding.attention_mask,
    max_length=128,
    temperature=0.8,
    top_p=0.9,
    do_sample=True,
    num_return_sequences=1
)

# Decode and show result
translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"Response: '{translated_text}'")