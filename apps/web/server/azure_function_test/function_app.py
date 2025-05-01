import azure.functions as func
import logging
import json
import os
from azure.storage.blob import BlobServiceClient

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="ReadBlobTest")
def ReadBlobTest(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Function triggered by Logic App.")

    try:
        req_body = req.get_json()
        subject = req_body.get("subject", "Unknown")
        blob_name = req_body.get("blob_filename")
        timestamp = req_body.get("timestamp", "")
        logging.info(f"Payload: {json.dumps(req_body)}")
    except ValueError:
        logging.error("Invalid JSON body.")
        return func.HttpResponse("Bad request", status_code=400)

    if not blob_name:
        logging.warning("Missing blob_filename in request.")
        return func.HttpResponse("Missing blob_filename", status_code=400)

    try:
        # Read blob content from the 'mailbody' container
        conn_str = os.getenv("AzureWebJobsStorage")
        blob_service = BlobServiceClient.from_connection_string(conn_str)
        container = blob_service.get_container_client("mailbody")
        blob_client = container.get_blob_client(blob_name)
        blob_content = blob_client.download_blob().readall().decode("utf-8")
    except Exception as e:
        logging.error(f"Failed to read blob: {e}")
        return func.HttpResponse("Error reading blob", status_code=500)

    # Build structured result
    result = {
        "subject": subject,
        "blob_filename": blob_name,
        "timestamp": timestamp,
        "body": blob_content
    }

    logging.info(f"Structured payload: {json.dumps(result)}")

    return func.HttpResponse(
        json.dumps(result),
        mimetype="application/json",
        status_code=200
    )
