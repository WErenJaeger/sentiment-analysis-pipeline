FROM python:3.11-slim AS builder

RUN apt-get update && apt-get install -y gcc g++ && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/
RUN pip install --no-cache-dir --target=/deps -r /tmp/requirements.txt

FROM public.ecr.aws/lambda/python:3.11

COPY --from=builder /deps ${LAMBDA_TASK_ROOT}
COPY model/ ${LAMBDA_TASK_ROOT}/model/
RUN chmod -R 644 ${LAMBDA_TASK_ROOT}/model/*
COPY app.py ${LAMBDA_TASK_ROOT}/

CMD ["app.handler"]
