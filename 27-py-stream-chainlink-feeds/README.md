# 27 — Stream Chainlink AnswerUpdated (Python)

Stream `AnswerUpdated` events from Chainlink aggregators (topic0 filter).

Proxies don't emit this event — we match the topic across aggregators.

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```
